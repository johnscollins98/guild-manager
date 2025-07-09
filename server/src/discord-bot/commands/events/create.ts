import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandUserOption
} from 'discord.js';
import { Service } from 'typedi';
import { config } from '../../../config';
import { DayOfWeek, daysOfWeek, Permission } from '../../../dtos';
import { DiscordApiFactory } from '../../../services/discord/api-factory';
import { EventEmbedCreator } from '../../../services/discord/event-embed-creator';
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import { EventRepository } from '../../../services/repositories/event-repository';
import { Command } from '../../command-gatherer';

@Service()
export default class EventsCreateCommand implements Command {
  public readonly name: string;
  private readonly discordGuildApi: IDiscordGuildApi;
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly embedCreator: EventEmbedCreator,
    discordApiFactory: DiscordApiFactory
  ) {
    this.name = 'events-create';
    this.discordGuildApi = discordApiFactory.guildApi();
  }

  async getConfig() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Create an event')
      .addStringOption(
        new SlashCommandStringOption()
          .setRequired(true)
          .setName('title')
          .setDescription('Event title')
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setChoices(daysOfWeek.map(d => ({ name: d, value: d })))
          .setRequired(true)
          .setName('day-of-week')
          .setDescription('Day that event runs')
      )
      .addNumberOption(
        new SlashCommandNumberOption()
          .setMinValue(0)
          .setMaxValue(23)
          .setName('start-time-h')
          .setDescription('Start time (hour) (UTC)')
          .setRequired(true)
      )
      .addNumberOption(
        new SlashCommandNumberOption()
          .setMinValue(0)
          .setMaxValue(59)
          .setName('start-time-m')
          .setDescription('Start time (minutes) (UTC)')
          .setRequired(true)
      )
      .addNumberOption(
        new SlashCommandNumberOption()
          .setMinValue(0)
          .setMaxValue(4)
          .setName('duration')
          .setDescription('Duration (in hours)')
          .setRequired(true)
      )
      .addUserOption(
        new SlashCommandUserOption()
          .setName('leader')
          .setDescription('Leader of event')
          .setRequired(true)
      )
      .addBooleanOption(
        new SlashCommandBooleanOption()
          .setName('ignored')
          .setDescription('Should be ignored in schedule')
          .setRequired(false)
      );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const dayOfWeek = interaction.options.getString('day-of-week', true) as DayOfWeek;
    const startH = interaction.options.getNumber('start-time-h', true);
    const startM = interaction.options.getNumber('start-time-m', true);
    const duration = interaction.options.getNumber('duration', true);
    const leader = interaction.options.getUser('leader', true);
    const ignore = interaction.options.getBoolean('ignored') ?? false;
    const title = interaction.options.getString('title', true);

    const member = await this.discordGuildApi.getMemberById(leader.id);
    if (!member || ![...config.eventRoles].some(r => member.roles.includes(r))) {
      interaction.editReply(`<@${leader.id}> is not a valid event leader.`);
    }

    const eventToCreate = {
      day: dayOfWeek,
      duration: duration + 'h',
      leaderId: leader.id,
      ignore,
      startTime: `${startH.toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${startM.toLocaleString(undefined, { minimumIntegerDigits: 2 })}`,
      title
    };

    const embedData = this.embedCreator.createEmbed(dayOfWeek, [eventToCreate]);
    const embed = new EmbedBuilder(embedData);

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Yes, create the event.')
      .setStyle(ButtonStyle.Primary);

    const rejectButton = new ButtonBuilder()
      .setCustomId('reject')
      .setLabel("No, I'll start again.")
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      confirmButton,
      rejectButton
    );

    const response = await interaction.editReply({
      content: 'Event created, here is a preview. Does this look correct?',
      embeds: [embed],
      components: [actionRow]
    });

    try {
      const reply = await response.awaitMessageComponent({ time: 60_000 });

      if (reply.customId === 'confirm') {
        await this.eventRepo.create(eventToCreate);
        reply.update({ content: 'Successfully created event.', embeds: [], components: [] });
      } else {
        reply.update({ content: 'Event not created.', embeds: [], components: [] });
      }
    } catch (err) {
      console.error(err);
      interaction.editReply({
        content: 'The command did not complete. Please try again',
        components: [],
        embeds: []
      });
    }

    await this.eventRepo.getAll();
  }

  getRequiredPermissions(): Permission[] {
    return ['EVENTS'];
  }
}
