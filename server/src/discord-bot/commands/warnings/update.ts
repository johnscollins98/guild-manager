import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import { Permission } from '../../../dtos';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { Command } from '../../command-gatherer';
import { WarningEditor } from '../../services/warnings/warning-editor';
import { WarningSelector } from '../../services/warnings/warning-selector';

@Service()
export default class WarningsUpdateCommand implements Command {
  public readonly name: string;

  constructor(
    private readonly warningsRepo: WarningsRepository,
    private readonly warningEditor: WarningEditor,
    private readonly warningSelector: WarningSelector
  ) {
    this.name = 'warnings-update';
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
    const warningSelection = await this.warningSelector.selectWarning(interaction, user?.id);

    if (!warningSelection) return;

    if (!warningSelection.value) {
      throw new Error('No warning id provided.');
    }

    const warning = await this.warningsRepo.getById(parseInt(warningSelection.value));

    if (!warning) {
      throw new Error('No warning with this ID');
    }

    await this.warningEditor.sendEditor(warning, warningSelection.interaction, async warning => {
      if (warning.id) {
        return this.warningsRepo.updateAndLog(warning.id, warning, interaction.user);
      }
      return null;
    });
  }
}
