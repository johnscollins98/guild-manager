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
import { Command } from '../../command-gatherer';
import { WarningEditor } from '../../services/warning-editor';

@Service()
export default class WarningsUpdateCommand implements Command {
  public readonly name: string;
  private readonly discordGuildApi: IDiscordGuildApi;

  constructor(
    private readonly warningsRepo: WarningsRepository,
    discordApiFactory: DiscordApiFactory,
    private readonly paginatedSelectCreator: PaginatedSelectCreator,
    private readonly warningEditor: WarningEditor
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

    await this.warningEditor.sendEditor(warning, res, async warning => {
      if (warning.id) {
        return this.warningsRepo.update(warning.id, {
          ...warning,
          lastUpdatedBy: interaction.user.id
        });
      }
      return null;
    });
  }
}
