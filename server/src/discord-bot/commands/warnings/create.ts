import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import { Permission, WarningCreateDTO, WarningType, WarningTypeLabels } from '../../../dtos';
import WarningsRepository from '../../../services/repositories/warnings-repository';
import { Command } from '../../command-gatherer';
import { WarningEditor } from '../../services/warning-editor';

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

    const saveBtn = new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setLabel('Yes, save it.')
      .setCustomId('save-warning');

    const editBtn = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel('No, make changes.')
      .setCustomId('edit-warning');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents([saveBtn, editBtn]);

    const msg = await interaction.editReply({
      content: 'Are you happy with this Warning?',
      embeds: [this.warningEditor.createWarningDetailsEmbed(warning)],
      components: [row]
    });

    const res = await msg.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60_000
    });

    const submitHandler = (w: WarningCreateDTO) => this.warningsRepo.create(w);

    if (res.customId === 'save-warning') {
      const saved = await submitHandler(warning);
      res.update({
        content: 'Success!',
        embeds: [this.warningEditor.createWarningDetailsEmbed(saved)],
        components: []
      });
    } else {
      await this.warningEditor.sendEditor(warning, res, w => this.warningsRepo.create(w));
    }
  }
}
