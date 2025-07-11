import {
  ActionRowBuilder,
  ComponentType,
  MessageComponentInteraction,
  ModalBuilder,
  SelectMenuComponentOptionData,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  UserSelectMenuComponentData
} from 'discord.js';
import { Service } from 'typedi';
import { PaginatedSelectCreator } from './paginated-select-creator';
import { respond, RespondableInteraction } from './respond';

@Service()
export class EditorHelpers {
  constructor(private readonly paginatedSelect: PaginatedSelectCreator) {}
  async fetchFromList(
    interaction: RespondableInteraction,
    optionConfigs: SelectMenuComponentOptionData[],
    id: string,
    label: string
  ) {
    const options = optionConfigs.map(config => {
      return new StringSelectMenuOptionBuilder(config);
    });

    const message = await this.paginatedSelect.create(interaction, options, label, id);

    const res = await message.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    return { value: res.values[0], interaction: res };
  }

  async fetchUser(
    interaction: RespondableInteraction,
    menuConfig: Partial<UserSelectMenuComponentData>
  ) {
    const userMenu = new UserSelectMenuBuilder(menuConfig);

    const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userMenu);

    const msg = await respond(interaction, {
      content: 'Please select a new user for the warning',
      components: [row]
    });

    const res = await msg.awaitMessageComponent({
      componentType: ComponentType.UserSelect,
      time: 60_000
    });

    return { value: res.values[0], interaction: res };
  }

  async fetchText(
    interaction: MessageComponentInteraction,
    id: string,
    label: string,
    value: string,
    style: TextInputStyle
  ) {
    const modal = new ModalBuilder().setTitle(label).setCustomId(`modal-${id}`);

    const input = new TextInputBuilder()
      .setCustomId(id)
      .setLabel(label)
      .setValue(value)
      .setRequired(true)
      .setStyle(style);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

    modal.addComponents(row);

    await interaction.showModal(modal);

    await interaction.editReply({
      content: 'Please fill in the form.',
      components: []
    });

    const modalInteraction = await interaction.awaitModalSubmit({
      time: 60_000
    });

    if (!modalInteraction.isFromMessage()) {
      // this shouldn't happen
      throw new Error('Modal Interaction is nto from message');
    }

    const res = modalInteraction.fields.getTextInputValue(id);

    return { value: res, interaction: modalInteraction };
  }
}
