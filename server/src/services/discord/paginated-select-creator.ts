import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { PaginatedMessageCreator } from './paginated-message-creator';

@Service()
export class PaginatedSelectCreator {
  constructor(private readonly paginatedMessageCreator: PaginatedMessageCreator) {}

  async create(
    interaction: ChatInputCommandInteraction,
    options: StringSelectMenuOptionBuilder[],
    label: string,
    id: string,
    numPerPage = 25,
    time = 60_000
  ) {
    const pages: InteractionEditReplyOptions[] = [];
    for (let i = 0; i < options.length; i += numPerPage) {
      const selectmenu = new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(label)
        .addOptions(options.slice(i, i + numPerPage));

      const action = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectmenu);

      const page: InteractionEditReplyOptions = {
        content: label,
        components: [action]
      };

      pages.push(page);
    }

    const response = await this.paginatedMessageCreator.create(interaction, pages, time);

    return response;
  }
}
