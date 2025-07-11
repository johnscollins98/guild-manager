import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import { Permission, WarningCreateDTO, WarningType, WarningTypeLabels } from '../../../dtos';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { Command } from '../../command-gatherer';
import { WarningEditor } from '../../services/warnings/warning-editor';

@Service()
export default class WarningsGiveCommand implements Command {
  public readonly name: string;

  constructor(
    private readonly warningsRepo: WarningsRepository,
    private readonly warningEditor: WarningEditor
  ) {
    this.name = 'warnings-give';
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Give warning to user')
      .addUserOption(
        new SlashCommandUserOption()
          .setName('user')
          .setDescription('Warning recipient')
          .setRequired(true)
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName('type')
          .setRequired(true)
          .setDescription('Type of warning')
          .setChoices(
            Object.values(WarningType).map(v => ({ name: WarningTypeLabels[v], value: v }))
          )
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName('reason')
          .setDescription('Reason for warning')
          .setRequired(true)
      );
  }

  getRequiredPermissions(): Permission[] {
    return ['WARNINGS'];
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const type = interaction.options.getString('type', true) as WarningType;

    const warning = {
      givenTo: user.id,
      reason: reason,
      givenBy: interaction.user.id,
      type
    };

    const submitHandler = (w: WarningCreateDTO) => this.warningsRepo.create(w);

    await this.warningEditor.sendEditor(warning, interaction, submitHandler);
  }
}
