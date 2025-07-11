import {
  ActionRowBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { Service } from 'typedi';
import { respond, RespondableInteraction } from './respond';

@Service()
export class PaginatedMessageCreator {
  async create(interaction: RespondableInteraction, pages: BaseMessageOptions[], time = 30 * 1000) {
    let index = 0;
    const pageCount = pages.length;

    const firstBtn = new ButtonBuilder()
      .setCustomId('pagefirst')
      .setEmoji('⏪')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const prevBtn = new ButtonBuilder()
      .setCustomId('prevpage')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const pageCountBtn = new ButtonBuilder()
      .setCustomId('pagecount')
      .setLabel(`${index + 1}/${pageCount}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const nextBtn = new ButtonBuilder()
      .setCustomId('nextpage')
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Primary);

    const lastBtn = new ButtonBuilder()
      .setCustomId('lastpage')
      .setEmoji('⏩')
      .setStyle(ButtonStyle.Primary);

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents([
      firstBtn,
      prevBtn,
      pageCountBtn,
      nextBtn,
      lastBtn
    ]);

    const message = await respond(interaction, {
      ...pages[index]!,
      components: [...(pages[index]?.components ?? []), ...(pageCount > 1 ? [buttons] : [])]
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time
    });

    collector.on('collect', async i => {
      if (i.customId === 'pagefirst') {
        index = 0;
      } else if (i.customId === 'prevpage') {
        if (index > 0) index--;
      } else if (i.customId === 'nextpage') {
        if (index < pageCount - 1) index++;
      } else if (i.customId === 'lastpage') {
        index = pageCount - 1;
      } else {
        return;
      }

      await i.deferUpdate();

      const firstsDisabled = index === 0;
      const lastDisabled = index === pageCount - 1;

      firstBtn.setDisabled(firstsDisabled);
      prevBtn.setDisabled(firstsDisabled);
      lastBtn.setDisabled(lastDisabled);
      nextBtn.setDisabled(lastDisabled);

      pageCountBtn.setLabel(`${index + 1}/${pageCount}`);

      try {
        await respond(interaction, {
          ...pages[index]!,
          components: [...(pages[index]?.components ?? []), buttons]
        });
      } catch (err) {
        console.error(err);
        await respond(interaction, {
          content: 'Something went wrong, please try again!'
        });
      }

      return collector.resetTimer();
    });

    collector.on('end', async () => {
      try {
        await respond(interaction, {
          ...pages[index]!,
          components: []
        });
      } catch (err) {
        console.error(err);
        await respond(interaction, {
          content: 'Something went wrong, please try again!'
        });
      }
    });

    return message;
  }
}
