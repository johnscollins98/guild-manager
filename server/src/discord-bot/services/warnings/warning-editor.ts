import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  MessageComponentInteraction,
  TextInputStyle
} from 'discord.js';
import { Service } from 'typedi';
import { WarningCreateDTO, WarningType, WarningTypeLabels } from '../../../dtos';
import { Warning } from '../../../models/warning.model';
import { EditorHelpers } from '../editor-helpers';
import { respond, RespondableInteraction } from '../respond';

@Service()
export class WarningEditor {
  private onSubmit: ((w: WarningCreateDTO) => Promise<Warning | null>) | undefined;

  constructor(private readonly modalTextFetch: EditorHelpers) {}

  async sendEditor(
    warning: WarningCreateDTO,
    interaction: RespondableInteraction,
    onSubmit: ((w: WarningCreateDTO) => Promise<Warning | null>) | undefined
  ) {
    this.onSubmit = onSubmit;

    const embed = this.createWarningDetailsEmbed(warning);

    const typeBtn = new ButtonBuilder()
      .setLabel('Type')
      .setCustomId('type')
      .setStyle(ButtonStyle.Primary);

    const reasonBtn = new ButtonBuilder()
      .setLabel('Reason')
      .setCustomId('reason')
      .setStyle(ButtonStyle.Primary);

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

    const editSelectMessage = await respond(interaction, {
      content: 'Would you like to change anything?',
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

  private async onTypeSelected(
    warning: WarningCreateDTO,
    interaction: MessageComponentInteraction
  ) {
    const { value, interaction: textFetchInteraction } = await this.modalTextFetch.fetchFromList(
      interaction,
      Object.entries(WarningTypeLabels).map(([k, v]) => ({ value: k, label: v })),
      'warning-type-select',
      'Please select a warning type'
    );

    if (!value) {
      throw new Error('No type selected');
    }

    if (!WarningTypeLabels[value as WarningType]) {
      throw new Error('Invalid type selected');
    }

    await this.sendEditor(
      { ...warning, type: value as WarningType },
      textFetchInteraction,
      this.onSubmit
    );
  }

  private async onGivenToSelected(
    warning: WarningCreateDTO,
    interaction: MessageComponentInteraction
  ) {
    const { value: user, interaction: fetchInteraction } = await this.modalTextFetch.fetchUser(
      interaction,
      { placeholder: 'Select a discord user', customId: 'user-select' }
    );

    if (!user) {
      throw new Error('No user selected');
    }

    await this.sendEditor({ ...warning, givenTo: user }, fetchInteraction, this.onSubmit);
  }

  private async onReasonSelected(
    warning: WarningCreateDTO,
    interaction: MessageComponentInteraction
  ) {
    const id = `warning-${warning.id}`;

    const { value, interaction: modalInteraction } = await this.modalTextFetch.fetchText(
      interaction,
      id,
      'Warning Reason',
      warning.reason,
      TextInputStyle.Paragraph
    );

    await this.sendEditor({ ...warning, reason: value }, modalInteraction, this.onSubmit);
  }

  private async onDoneSelected(
    warning: WarningCreateDTO,
    interaction: MessageComponentInteraction
  ) {
    if (!this.onSubmit) {
      throw new Error('No submit handler');
    }

    const saved = await this.onSubmit(warning);

    if (!saved) {
      await interaction.update('Failed to save warning.');
      return;
    }

    const embed = this.createWarningDetailsEmbed(saved);

    await interaction.update({
      content: 'Success!',
      embeds: [embed],
      components: []
    });
  }

  public createWarningDetailsEmbed(warning: WarningCreateDTO) {
    return new EmbedBuilder().setTitle('Warning').setFields([
      { name: 'Type', value: WarningTypeLabels[warning.type], inline: true },
      { name: 'Given To', value: `<@${warning.givenTo}>`, inline: true },
      { name: 'Given By', value: `<@${warning.givenBy}>`, inline: true },
      { name: 'Reason', value: warning.reason.substring(0, 50) },
      ...(warning.lastUpdatedBy && warning.lastUpdatedTimestamp
        ? [
            { name: 'Last Updated By', value: `<@${warning.lastUpdatedBy}>`, inline: true },
            {
              name: 'On',
              value: `<t:${Math.floor(warning.lastUpdatedTimestamp.valueOf() / 1000)}:d>`,
              inline: true
            }
          ]
        : [])
    ]);
  }
}
