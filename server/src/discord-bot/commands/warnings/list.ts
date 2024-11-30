import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { Command } from '../../command-factory';

@Service()
export default class WarningsListCommand implements Command {
  public readonly name: string;
  constructor(private readonly warningsRepo: WarningsRepository) {
    this.name = 'warnings-list';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('List all warnings')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addUserOption(
        new SlashCommandUserOption()
          .setName('given-to-user')
          .setDescription('Filter by user given to')
      );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const memberId = interaction.options.getUser('given-to-user');

    const warnings = await this.warningsRepo.getAllWhereGivenToIncludes(memberId?.id);

    interaction.editReply({
      content:
        warnings
          .map(
            w =>
              `* "${w.reason}"\n\tGiven to <@${w.givenTo}> by <@${w.givenBy}> on <t:${Math.floor(w.timestamp.valueOf() / 1000)}:d>`
          )
          .join('\n') || 'There are no warnings.'
    });
  }
}
