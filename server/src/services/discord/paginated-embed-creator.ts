import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Colors,
  ComponentType,
  EmbedBuilder
} from 'discord.js';
import { Service } from 'typedi';

@Service()
export class PaginatedEmbedCreator {
  async create(interaction: ChatInputCommandInteraction, pages: EmbedBuilder[], time = 30 * 1000) {
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
    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    if (pageCount > 1) components.push(buttons);

    const message = await interaction.editReply({
      embeds: [pages[index]!.setColor(Colors.Blue)],
      components
    });

    const collector = await message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return await i.reply({ content: `Only <@${interaction.user.id}> can respond.` });

      await i.deferUpdate();

      if (i.customId === 'pagefirst') {
        index = 0;
      }

      if (i.customId === 'prevpage') {
        if (index > 0) index--;
      }

      if (i.customId === 'nextpage') {
        if (index < pageCount - 1) index++;
      }

      if (i.customId === 'lastpage') {
        index = pageCount - 1;
      }

      const firstsDisabled = index === 0;
      const lastDisabled = index === pageCount - 1;

      firstBtn.setDisabled(firstsDisabled);
      prevBtn.setDisabled(firstsDisabled);
      lastBtn.setDisabled(lastDisabled);
      nextBtn.setDisabled(lastDisabled);

      pageCountBtn.setLabel(`${index + 1}/${pageCount}`);

      try {
        await interaction.editReply({
          embeds: [pages[index]!.setColor(Colors.Blue)],
          components
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({
          content: 'Something went wrong, please try again!'
        });
      }

      return collector.resetTimer();
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({
          embeds: [pages[index]!.setColor(Colors.Grey)],
          components: []
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({
          content: 'Something went wrong, please try again!'
        });
      }
    });
  }
}
