import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionEditReplyOptions,
  SlashCommandBuilder,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import { Permission, WarningTypeLabels } from '../../../dtos';
import { PaginatedMessageCreator } from '../../../services/discord/paginated-message-creator';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { Command } from '../../command-factory';

@Service()
export default class WarningsListCommand implements Command {
  public readonly name: string;
  constructor(
    private readonly warningsRepo: WarningsRepository,
    private readonly paginationCreator: PaginatedMessageCreator
  ) {
    this.name = 'warnings-list';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('List all warnings')
      .addUserOption(
        new SlashCommandUserOption()
          .setName('given-to-user')
          .setDescription('Filter by user given to')
      );
  }

  getRequiredPermissions(): Permission[] {
    return [];
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const memberId = interaction.options.getUser('given-to-user');

    const warningsPerPage = 10;

    const warnings = await this.warningsRepo.getAllWhereGivenToIncludes(memberId?.id);

    if (warnings.length === 0) {
      await interaction.editReply({ content: 'There are no warnings to display.' });
      return;
    }

    const warningsSorted = warnings.sort(
      (a, b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf()
    );

    const embeds: InteractionEditReplyOptions[] = [];

    for (let i = 0; i < warningsSorted.length; i += warningsPerPage) {
      const startIndex = i;
      const endIndex = startIndex + warningsPerPage - 1;

      const slice = warningsSorted.slice(startIndex, endIndex);

      const embed = new EmbedBuilder().setTitle('Warning List').addFields(
        slice.map(w => ({
          name: `<t:${Math.floor(w.timestamp.valueOf() / 1000)}:d> (${WarningTypeLabels[w.type]})`,
          value: `**Given to <@${w.givenTo}> by <@${w.givenBy}>**.\n${w.reason.substring(0, 900)}`
        }))
      );

      embeds.push({
        embeds: [embed]
      });
    }

    await this.paginationCreator.create(interaction, embeds);
  }
}
