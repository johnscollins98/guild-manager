import {
  ActionRowBuilder,
  BaseMessageOptions,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { Service } from 'typedi';
import { PaginatedMessageCreator } from './paginated-message-creator';
import { RespondableInteraction } from './respond';

@Service()
export class PaginatedSelectCreator {
  constructor(private readonly paginatedMessageCreator: PaginatedMessageCreator) {}

  async create(
    interaction: RespondableInteraction,
    options: StringSelectMenuOptionBuilder[],
    label: string,
    id: string,
    numPerPage = 25,
    time = 60_000
  ) {
    const pages: BaseMessageOptions[] = [];
    for (let i = 0; i < options.length; i += numPerPage) {
      const selectmenu = new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(label)
        .addOptions(options.slice(i, i + numPerPage));

      const action = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectmenu);

      const page = {
        content: label,
        components: [action]
      };

      pages.push(page);
    }

    const response = await this.paginatedMessageCreator.create(interaction, pages, time);

    return response;
  }
}
