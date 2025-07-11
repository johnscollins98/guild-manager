import {
  ChatInputCommandInteraction,
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
import { IDiscordGuildApi } from '../../../services/discord/guild-api';
import { EventRepository } from '../../../services/repositories/event-repository';
import { Command } from '../../command-gatherer';
import { EventEditor } from '../../services/event-editor';
import { EventPoster } from '../../services/events/post-updated-events';

@Service()
export default class EventsCreateCommand implements Command {
  public readonly name: string;
  private readonly discordGuildApi: IDiscordGuildApi;
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly eventEditor: EventEditor,
    private readonly eventPoster: EventPoster,
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

    const { event, interaction: editor } = await this.eventEditor.sendEditor(
      eventToCreate,
      interaction
    );
    await this.eventRepo.create(event);

    await this.eventPoster.postEventSequence(editor, 'Added new event');
  }

  getRequiredPermissions(): Permission[] {
    return ['EVENTS'];
  }
}
