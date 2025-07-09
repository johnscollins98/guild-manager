import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  MessageComponentInteraction,
  SlashCommandBuilder,
  SlashCommandUserOption,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { Permission, WarningType, WarningTypeLabels } from '../../../dtos';
import { Warning } from '../../../models/warning.model';
import { DiscordApiFactory } from '../../../services/discord/api-factory';
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import { PaginatedSelectCreator } from '../../../services/discord/paginated-select-creator';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { Command } from '../../command-gatherer';

@Service()
export default class WarningsUpdateCommand implements Command {
  public readonly name: string;
  private readonly discordGuildApi: IDiscordGuildApi;

  constructor(
    private readonly warningsRepo: WarningsRepository,
    discordApiFactory: DiscordApiFactory,
    private readonly paginatedSelectCreator: PaginatedSelectCreator
  ) {
    this.name = 'warnings-update';
    this.discordGuildApi = discordApiFactory.guildApi();
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Update warning for user')
      .addUserOption(
        new SlashCommandUserOption()
          .setName('user')
          .setDescription('Warning recipient')
          .setRequired(false)
      );
  }

  getRequiredPermissions(): Permission[] {
    return ['WARNINGS'];
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', false);

    const warningsForUser = await this.warningsRepo.getAllWhereGivenToIncludes(user?.id);

    if (warningsForUser.length === 0) {
      interaction.editReply(`There are no warnings to update.`);
    }

    const discordUsers = await this.discordGuildApi.getMembers();

    const warningsSorted = warningsForUser.sort(
      (a, b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf()
    );

    const warningOptions = warningsSorted.map(warning => {
      const discordUser = discordUsers.find(u => u.user?.id === warning.givenTo);
      const username =
        discordUser?.nick ??
        discordUser?.user?.global_name ??
        discordUser?.user?.username ??
        'Unknown User';

      return new StringSelectMenuOptionBuilder()
        .setLabel(warning.reason.substring(0, 50))
        .setDescription(
          `Given to ${username} on ${new Date(warning.timestamp).toDateString()} (${WarningTypeLabels[warning.type]})`
        )
        .setValue(`${warning.id}`);
    });

    const response = await this.paginatedSelectCreator.create(
      interaction,
      warningOptions,
      'Please select a warning to update.',
      'warning-id'
    );

    const res = await response.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    const warningId = res.values[0];
    if (!warningId) {
      throw new Error('No warning id provided.');
    }

    const warning = await this.warningsRepo.getById(parseInt(warningId));

    if (!warning) {
      throw new Error('No warning with this ID');
    }

    await this.sendUpdateEmbed(warning, res);
  }

  private createWarningDetailsEmbed(warning: Warning) {
    return new EmbedBuilder().setTitle('Warning To Update').setFields([
      { name: 'Type', value: WarningTypeLabels[warning.type], inline: true },
      { name: 'Given To', value: `<@${warning.givenTo}>`, inline: true },
      { name: 'Given By', value: `<@${warning.givenBy}>`, inline: true },
      { name: 'Reason', value: warning.reason.substring(0, 50) },
      ...(warning.lastUpdatedBy
        ? [
            { name: 'Last Updated By', value: `<@${warning.lastUpdatedBy}>`, inline: true },
            {
              name: 'On',
              value: `<t:${Math.floor(warning.timestamp.valueOf() / 1000)}:d>`,
              inline: true
            }
          ]
        : [])
    ]);
  }

  private async sendUpdateEmbed(warning: Warning, interaction: MessageComponentInteraction) {
    const embed = this.createWarningDetailsEmbed(warning);

    const typeBtn = new ButtonBuilder()
      .setLabel('Type')
      .setCustomId('type')
      .setStyle(ButtonStyle.Primary);

    const reasonBtn = new ButtonBuilder()
      .setLabel('Reason')
      .setCustomId('reason')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const givenToBtn = new ButtonBuilder()
      .setLabel('Given To')
      .setCustomId('given-to')
      .setStyle(ButtonStyle.Primary);

    const doneBtn = new ButtonBuilder()
      .setLabel('Done')
      .setCustomId('done')
      .setStyle(ButtonStyle.Success);

    const actionRow = new ActionRowBuilder<ButtonBuilder>({
      components: [typeBtn, givenToBtn, reasonBtn, doneBtn]
    });

    const editSelectMessage = await interaction.update({
      content: 'Select what you would like to update.',
      embeds: [embed],
      components: [actionRow]
    });

    const editSelectResponse = await editSelectMessage.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60_000
    });

    if (editSelectResponse.customId === 'type') {
      await this.onTypeSelected(warning, editSelectResponse);
    } else if (editSelectResponse.customId === 'given-to') {
      await this.onGivenToSelected(warning, editSelectResponse);
    } else if (editSelectResponse.customId === 'reason') {
      await this.onReasonSelected(warning, editSelectResponse);
    } else {
      await this.onDoneSelected(warning, editSelectResponse);
    }
  }

  private async onTypeSelected(warning: Warning, interaction: MessageComponentInteraction) {
    const typeMenu = new StringSelectMenuBuilder()
      .setPlaceholder('Please select a Warning type')
      .setCustomId('type-select')
      .addOptions(
        Object.entries(WarningTypeLabels).map(([k, v]) =>
          new StringSelectMenuOptionBuilder().setLabel(v).setValue(k)
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(typeMenu);

    const msg = await interaction.update({
      content: 'Please select a new type for the warning',
      embeds: [this.createWarningDetailsEmbed(warning)],
      components: [row]
    });

    const res = await msg.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    const type = res.values[0];

    if (!type) {
      throw new Error('No type selected');
    }

    if (!WarningTypeLabels[type as WarningType]) {
      throw new Error('Invalid type selected');
    }

    await this.sendUpdateEmbed({ ...warning, type: type as WarningType }, res);
  }

  private async onGivenToSelected(warning: Warning, interaction: MessageComponentInteraction) {
    const userMenu = new UserSelectMenuBuilder()
      .setPlaceholder('Select a discord user')
      .setCustomId('user-select');

    const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userMenu);

    const msg = await interaction.update({
      content: 'Please select a new user for the warning',
      embeds: [this.createWarningDetailsEmbed(warning)],
      components: [row]
    });

    const res = await msg.awaitMessageComponent({
      componentType: ComponentType.UserSelect,
      time: 60_000
    });

    const user = res.values[0];

    if (!user) {
      throw new Error('No user selected');
    }

    await this.sendUpdateEmbed({ ...warning, givenTo: user }, res);
  }

  private async onReasonSelected(_warning: Warning, interaction: MessageComponentInteraction) {
    await interaction.update({ content: 'Unsupported' });
  }

  private async onDoneSelected(warning: Warning, interaction: MessageComponentInteraction) {
    const updated = await this.warningsRepo.update(warning.id, {
      ...warning,
      lastUpdatedBy: interaction.user.id
    });

    if (!updated) {
      await interaction.update('Failed to update warning.');
      return;
    }

    const embed = this.createWarningDetailsEmbed(updated);

    await interaction.update({
      content: 'Successfully updated warning.',
      embeds: [embed],
      components: []
    });
  }
}
