import {
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
  SlashCommandUserOption,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { Permission, WarningTypeLabels } from '../../../dtos';
import { DiscordApiFactory } from '../../../services/discord/api-factory';
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import { PaginatedSelectCreator } from '../../../services/discord/paginated-select-creator';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { Command } from '../../command-factory';

@Service()
export default class WarningsDeleteCommand implements Command {
  public readonly name: string;

  private readonly discordGuildApi: IDiscordGuildApi;

  constructor(
    private readonly warningsRepo: WarningsRepository,
    private readonly paginatedSelectCreator: PaginatedSelectCreator,
    discordApiFactory: DiscordApiFactory
  ) {
    this.name = 'warnings-delete';
    this.discordGuildApi = discordApiFactory.guildApi();
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Delete a warning')
      .addUserOption(
        new SlashCommandUserOption()
          .setName('given-to-user')
          .setDescription('Optionally filter options by user given to')
      );
  }

  getRequiredPermissions(): Permission[] {
    return ['WARNINGS'];
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const givenToUser = interaction.options.getUser('given-to-user');
    const warnings = await this.warningsRepo.getAllWhereGivenToIncludes(givenToUser?.id);

    const warningsSorted = warnings.sort(
      (a, b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf()
    );

    const discordUsers = await this.discordGuildApi.getMembers();

    if (warningsSorted.length === 0) {
      interaction.editReply('There are no warnings to delete');
      return;
    }

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
      'Please select a warning',
      'warning-id'
    );

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    collector.on('collect', async i => {
      try {
        const warningId = i.values[0];
        if (!warningId) {
          throw new Error('No warning id provided.');
        }

        const deleted = await this.warningsRepo.delete(parseInt(warningId));

        if (deleted) {
          i.update({ content: 'Successfully deleted warning.', components: [] });
        } else {
          i.update({ content: 'Failed to delete warning, please try again.', components: [] });
        }
      } catch (err) {
        console.error(err);
        interaction.editReply({
          content: 'The command did not complete. Please try again',
          components: []
        });
      }
    });
  }
}
