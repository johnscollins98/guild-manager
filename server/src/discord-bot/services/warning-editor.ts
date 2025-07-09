import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  MessageComponentInteraction,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { WarningCreateDTO, WarningType, WarningTypeLabels } from '../../dtos';
import { Warning } from '../../models/warning.model';

@Service()
export class WarningEditor {
  private onSubmit: ((w: WarningCreateDTO) => Promise<Warning | null>) | undefined;

  constructor() {}

  async sendEditor(
    warning: WarningCreateDTO,
    interaction: MessageComponentInteraction,
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

    const editSelectMessage = await interaction.update({
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
    const typeMenu = new StringSelectMenuBuilder()
      .setPlaceholder('Please select a Warning type')
      .setCustomId('type-select')
      .addOptions(
        Object.entries(WarningTypeLabels).map(([k, v]) =>
          new StringSelectMenuOptionBuilder().setLabel(v).setValue(k)
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(typeMenu);

    const msg = await interaction.update({
      content: 'Please select a new type for the warning',
      embeds: [this.createWarningDetailsEmbed(warning)],
      components: [row]
    });

    const res = await msg.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    const type = res.values[0];

    if (!type) {
      throw new Error('No type selected');
    }

    if (!WarningTypeLabels[type as WarningType]) {
      throw new Error('Invalid type selected');
    }

    await this.sendEditor({ ...warning, type: type as WarningType }, res, this.onSubmit);
  }

  private async onGivenToSelected(
    warning: WarningCreateDTO,
    interaction: MessageComponentInteraction
  ) {
    const userMenu = new UserSelectMenuBuilder()
      .setPlaceholder('Select a discord user')
      .setCustomId('user-select');

    const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userMenu);

    const msg = await interaction.update({
      content: 'Please select a new user for the warning',
      embeds: [this.createWarningDetailsEmbed(warning)],
      components: [row]
    });

    const res = await msg.awaitMessageComponent({
      componentType: ComponentType.UserSelect,
      time: 60_000
    });

    const user = res.values[0];

    if (!user) {
      throw new Error('No user selected');
    }

    await this.sendEditor({ ...warning, givenTo: user }, res, this.onSubmit);
  }

  private async onReasonSelected(
    warning: WarningCreateDTO,
    interaction: MessageComponentInteraction
  ) {
    const id = `warning-${warning.id}`;
    const modal = new ModalBuilder().setTitle('Warning Reason').setCustomId(id);

    const input = new TextInputBuilder()
      .setCustomId('reason-input')
      .setLabel('Warning Reason')
      .setValue(warning.reason)
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

    modal.addComponents(row);

    await interaction.showModal(modal);

    await interaction.editReply({
      content: 'Please fill in the form.',
      embeds: [],
      components: []
    });

    const modalInteraction = await interaction.awaitModalSubmit({
      time: 60_000
    });

    const value = modalInteraction.fields.getTextInputValue('reason-input');

    await this.sendEditor(
      { ...warning, reason: value },
      modalInteraction as unknown as MessageComponentInteraction,
      this.onSubmit
    );
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
