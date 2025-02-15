import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandUserOption,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { WarningTypeLabels } from '../../../dtos';
import { DiscordApiFactory } from '../../../services/discord/api-factory';
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { Command } from '../../command-factory';

@Service()
export default class WarningsDeleteCommand implements Command {
  public readonly name: string;

  private readonly discordGuildApi: IDiscordGuildApi;

  constructor(
    private readonly warningsRepo: WarningsRepository,
    discordApiFactory: DiscordApiFactory
  ) {
    this.name = 'warnings-delete';
    this.discordGuildApi = discordApiFactory.guildApi();
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Delete a warning')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addUserOption(
        new SlashCommandUserOption()
          .setName('given-to-user')
          .setDescription('Optionally filter options by user given to')
      );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const givenToUser = interaction.options.getUser('given-to-user');
    const warnings = await this.warningsRepo.getAllWhereGivenToIncludes(givenToUser?.id);

    const discordUsers = await this.discordGuildApi.getMembers();

    if (warnings.length === 0) {
      interaction.editReply('There are no warnings to delete');
      return;
    }

    const warningOptions = warnings.map(warning => {
      const discordUser = discordUsers.find(u => u.user?.id === warning.givenTo);
      const username =
        discordUser?.nick ??
        discordUser?.user?.global_name ??
        discordUser?.user?.username ??
        'Unknown User';

      return new StringSelectMenuOptionBuilder()
        .setLabel(warning.reason)
        .setDescription(
          `Given to ${username} on ${new Date(warning.timestamp).toDateString()} (${WarningTypeLabels[warning.type]})`
        )
        .setValue(`${warning.id}`);
    });

    const warningSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('warning-id')
      .setPlaceholder('Select a warning to delete')
      .addOptions(warningOptions);

    const warningAction = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      warningSelectMenu
    );

    const response = await interaction.editReply({
      content: 'Please select a warning to delete',
      components: [warningAction]
    });

    try {
      const reply = await response.awaitMessageComponent({ time: 60_000 });

      if (!('values' in reply)) {
        throw new Error('No values in reply.');
      }

      const warningId = reply.values[0];
      if (!warningId) {
        throw new Error('No warning id provided.');
      }

      const deleted = await this.warningsRepo.delete(parseInt(warningId));

      if (deleted) {
        reply.update({ content: 'Successfully deleted warning.', components: [] });
      } else {
        reply.update({ content: 'Failed to delete warning, please try again.', components: [] });
      }
    } catch (err) {
      console.error(err);
      interaction.editReply({
        content: 'The command did not complete. Please try again',
        components: []
      });
    }
  }
}
