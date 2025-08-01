import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import { Permission } from '../../../dtos';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { Command } from '../../command-gatherer';
import { WarningSelector } from '../../services/warnings/warning-selector';

@Service()
export default class WarningsDeleteCommand implements Command {
  public readonly name: string;

  constructor(
    private readonly warningsRepo: WarningsRepository,
    private readonly warningSelector: WarningSelector
  ) {
    this.name = 'warnings-delete';
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
    const warningSelection = await this.warningSelector.selectWarning(interaction, givenToUser?.id);

    if (!warningSelection) return;

    if (!warningSelection.value) {
      throw new Error('No warning id provided.');
    }

    const deleted = await this.warningsRepo.deleteAndLog(
      parseInt(warningSelection.value),
      interaction.user
    );

    if (deleted) {
      warningSelection.interaction.update({
        content: 'Successfully deleted warning.',
        components: []
      });
    } else {
      warningSelection.interaction.update({
        content: 'Failed to delete warning, please try again.',
        components: []
      });
    }
  }
}
