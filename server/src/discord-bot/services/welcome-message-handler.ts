import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  GuildMember,
  Interaction,
  Message,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { config } from '../../config';
import { DiscordController } from '../../controllers/discord-controller';
import { MemberAssociation } from '../../models/member-association.model';
import { Manager } from '../../server';
import { matchesAccountName } from '../../utils/account-name-matching';

const accountButtonIdPrefix = 'gw2-account-form:';
const accountModalIdPrefix = 'gw2-account-submit:';

@Service()
export class WelcomeMessageHandler {
  private readonly associationRepo: Repository<MemberAssociation>;

  constructor(private readonly discordController: DiscordController) {
    this.associationRepo = Manager.getRepository(MemberAssociation);
  }

  async handle(message: Message<boolean>): Promise<void> {
    const member = message.member;
    if (!config.discordGuildId || message.guildId !== config.discordGuildId) return;
    if (!config.welcomeChannelId || message.channelId !== config.welcomeChannelId) return;
    if (
      !member ||
      member.id !== config.welcomeTestUserId ||
      member.user.bot ||
      !/\.\d{4}/.test(message.content)
    )
      return;

    if (await this.hasValidRoles(member)) return;

    await message.reply(
      `Thanks! ${config.recruitmentRoleId ? `A <@&${config.recruitmentRoleId}>` : 'We'} will get you invited in-game ASAP and keep you updated.`
    );

    if (config.pendingRoleId) {
      await member.roles.add(config.pendingRoleId);
    }
  }

  async handleMemberJoin(member: GuildMember): Promise<void> {
    if (member.id !== config.welcomeTestUserId || member.guild.id !== config.discordGuildId) return;
    if (!config.welcomeChannelId || (await this.hasValidRoles(member))) return;

    const button = new ButtonBuilder()
      .setCustomId(`${accountButtonIdPrefix}${member.id}`)
      .setLabel('Enter GW2 account name')
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    const channel = await member.guild.channels.fetch(config.welcomeChannelId);

    if (channel?.isSendable()) {
      await channel.send({
        content: `Welcome <@${member.id}>! Submit your GW2 account name using the button below.`,
        components: [row]
      });
    }
  }

  async handleInteraction(interaction: Interaction): Promise<void> {
    if (interaction.isButton() && interaction.customId.startsWith(accountButtonIdPrefix)) {
      const initiatingUserId = interaction.customId.slice(accountButtonIdPrefix.length);
      await this.showAccountModal(interaction, initiatingUserId);
    } else if (
      interaction.isModalSubmit() &&
      interaction.customId.startsWith(accountModalIdPrefix)
    ) {
      const initiatingUserId = interaction.customId.slice(accountModalIdPrefix.length);
      await this.submitAccountModal(interaction, initiatingUserId);
    }
  }

  private async showAccountModal(
    interaction: ButtonInteraction,
    initiatingUserId: string
  ): Promise<void> {
    if (interaction.user.id !== initiatingUserId) {
      await interaction.reply({
        content: 'This account form is only available to the invited member.',
        ephemeral: true
      });
      return;
    }

    const accountInput = new TextInputBuilder()
      .setCustomId('gw2-account-name')
      .setLabel('Full account name, including .####')
      .setPlaceholder('Name.1234')
      .setMinLength(6)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);
    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(accountInput);
    const modal = new ModalBuilder()
      .setCustomId(`${accountModalIdPrefix}${initiatingUserId}`)
      .setTitle('GW2 account name')
      .addComponents(row);

    await interaction.showModal(modal);
  }

  private async submitAccountModal(
    interaction: ModalSubmitInteraction,
    initiatingUserId: string
  ): Promise<void> {
    const guild = interaction.guild;
    if (interaction.user.id !== initiatingUserId) {
      await interaction.reply({
        content: 'This account form is only available to the invited member.',
        ephemeral: true
      });
      return;
    }
    if (!interaction.inGuild() || !guild || interaction.guildId !== config.discordGuildId) {
      await interaction.reply({
        content: 'Please submit this form in the server.',
        ephemeral: true
      });
      return;
    }

    const accountName = interaction.fields.getTextInputValue('gw2-account-name').trim();
    if (!/^[a-z0-9][a-z0-9 ]+\.\d{4}$/i.test(accountName)) {
      await interaction.reply({
        content: 'Enter the full account name in the format Name.1234.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const member = await guild.members.fetch(initiatingUserId);
      if (await this.hasValidRoles(member)) {
        await interaction.editReply(
          'No changes were made because you already have a valid guild role.'
        );
        return;
      }

      const associationConfirmed = await this.associateAndConfirm(accountName, member.id);
      if (!associationConfirmed) {
        console.warn(`Account ${accountName} is already associated with another Discord account`);
      }

      let updatedNickname: string | undefined;

      if (associationConfirmed) {
        try {
          updatedNickname = await this.updateNickname(member, accountName);
        } catch (error) {
          console.error(`Could not update nickname for ${member.id}`, error);
        }
      }

      try {
        const channel = await guild.channels.fetch(config.welcomeChannelId!);
        if (!channel?.isSendable()) throw new Error('Welcome channel is not sendable');

        await channel.send(
          `**GW2 account submission**\nDiscord member: <@${member.id}>\nAccount name: **${accountName}**${updatedNickname ? `\nNickname updated to **${updatedNickname}**.` : ''}`
        );
      } catch (error) {
        console.error('Could not post GW2 account submission to the welcome channel', error);
      }

      await interaction.editReply(
        `Thanks, your account details have been submitted.${updatedNickname ? ` I've updated your nickname to **${updatedNickname}**.` : ''}`
      );
    } catch (error) {
      console.error(`Could not process account form for ${initiatingUserId}`, error);
      await interaction.editReply(
        'The account form could not be processed. Please contact an officer.'
      );
    }
  }

  private async associateAndConfirm(
    accountName: string,
    discordAccountId: string
  ): Promise<boolean> {
    const associationRepo = this.associationRepo;
    await associationRepo
      .createQueryBuilder()
      .insert()
      .into(MemberAssociation)
      .values({ gw2AccountName: accountName, discordAccountId })
      .orIgnore()
      .execute();

    const association = await associationRepo.findOneBy({ gw2AccountName: accountName });
    return association?.discordAccountId === discordAccountId;
  }

  private async hasValidRoles(member: GuildMember): Promise<boolean> {
    const validRoles = await this.discordController.getRoles();
    return member.roles.cache.hasAny(...validRoles.map(role => role.id));
  }

  private async updateNickname(
    member: GuildMember,
    accountName: string
  ): Promise<string | undefined> {
    if (matchesAccountName(member.displayName, accountName)) return undefined;

    const nickname = `${member.displayName} (${accountName})`;
    const updatedNickname = nickname.length <= 32 ? nickname : accountName;
    await member.setNickname(updatedNickname);
    return updatedNickname;
  }
}
