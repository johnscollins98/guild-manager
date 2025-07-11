import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  ComponentType,
  SelectMenuComponentOptionData,
  TextInputStyle
} from 'discord.js';
import { Service } from 'typedi';
import { DayOfWeek, daysOfWeek, EventCreateDTO } from '../../dtos';
import { Event } from '../../models/event.model';
import { EventEmbedCreator } from '../../services/discord/event-embed-creator';
import { EditorHelpers } from './editor-helpers';
import { respond, RespondableInteraction } from './respond';

@Service()
export class EventEditor {
  private onSubmit: ((e: EventCreateDTO) => Promise<Event | null>) | undefined;

  constructor(
    private readonly embedCreator: EventEmbedCreator,
    private readonly editorHelpers: EditorHelpers
  ) {}

  async sendEditor(
    event: EventCreateDTO,
    interaction: RespondableInteraction,
    onSubmit: ((e: EventCreateDTO) => Promise<Event | null>) | undefined
  ) {
    this.onSubmit = onSubmit;

    const embed = this.createEventDetailsEmbed(event);

    const titleBtn = new ButtonBuilder()
      .setLabel('Title')
      .setCustomId('title')
      .setStyle(ButtonStyle.Primary);

    const dayOfWeekBtn = new ButtonBuilder()
      .setLabel('Day of week')
      .setCustomId('day-of-week')
      .setStyle(ButtonStyle.Primary);

    const startTimeBtn = new ButtonBuilder()
      .setLabel('Start Time (UTC)')
      .setCustomId('start-time')
      .setStyle(ButtonStyle.Primary);

    const durationBtn = new ButtonBuilder()
      .setLabel('Duration (h)')
      .setCustomId('duration')
      .setStyle(ButtonStyle.Primary);

    const leaderBtn = new ButtonBuilder()
      .setLabel('Leader')
      .setCustomId('leader')
      .setStyle(ButtonStyle.Primary);

    const ignoreBtn = new ButtonBuilder()
      .setLabel('Ignored')
      .setCustomId('ignored')
      .setStyle(ButtonStyle.Primary);

    const doneBtn = new ButtonBuilder()
      .setLabel('Done')
      .setCustomId('done')
      .setStyle(ButtonStyle.Success);

    const actionRow = new ActionRowBuilder<ButtonBuilder>({
      components: [titleBtn, dayOfWeekBtn, startTimeBtn]
    });

    const row2 = new ActionRowBuilder<ButtonBuilder>({
      components: [durationBtn, leaderBtn, ignoreBtn, doneBtn]
    });

    const editSelectMessage = await respond(interaction, {
      content: 'Would you like to change anything?',
      embeds: [embed],
      components: [actionRow, row2]
    });

    const editSelectResponse = await editSelectMessage.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60_000
    });

    switch (editSelectResponse.customId) {
      case 'title':
        return await this.onTitleSelected(event, editSelectResponse);
      case 'day-of-week':
        return await this.onDayOfWeekSelected(event, editSelectResponse);
      case 'start-time':
        return await this.onStartTimeHSelected(event, editSelectResponse);
      case 'duration':
        return await this.onDurationSelected(event, editSelectResponse);
      case 'leader':
        return await this.onLeaderSelected(event, editSelectResponse);
      case 'ignored':
        return await this.onIgnoredSelected(event, editSelectResponse);
      default:
        return await this.onDoneSelected(event, editSelectResponse);
    }
  }
  async onIgnoredSelected(event: EventCreateDTO, interaction: ButtonInteraction<CacheType>) {
    const { value, interaction: fetchInteraction } = await this.editorHelpers.fetchFromList(
      interaction,
      [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
      ],
      'ignored-selection',
      'Should event be ignored?'
    );

    if (value) {
      const ignored = value === 'true';
      event.ignore = ignored;
    }

    this.sendEditor(event, fetchInteraction, this.onSubmit);
  }
  private async onLeaderSelected(event: EventCreateDTO, interaction: ButtonInteraction<CacheType>) {
    const { value, interaction: fetchInteraction } = await this.editorHelpers.fetchUser(
      interaction,
      {
        customId: 'event-leader',
        placeholder: 'Please select an event leader'
      }
    );

    if (value) {
      event.leaderId = value;
    }

    this.sendEditor(event, fetchInteraction, this.onSubmit);
  }

  private async onTitleSelected(event: EventCreateDTO, interaction: ButtonInteraction) {
    const { value, interaction: fetchInteraction } = await this.editorHelpers.fetchText(
      interaction,
      'event-title',
      'Event Title',
      event.title,
      TextInputStyle.Short
    );

    this.sendEditor({ ...event, title: value }, fetchInteraction, this.onSubmit);
  }

  private async onDayOfWeekSelected(event: EventCreateDTO, interaction: ButtonInteraction) {
    const options: SelectMenuComponentOptionData[] = daysOfWeek.map(d => ({ label: d, value: d }));

    const selection = await this.editorHelpers.fetchFromList(
      interaction,
      options,
      'day-selection',
      'Select a day of the week'
    );

    if (!selection) return;

    if (selection.value && daysOfWeek.includes(selection.value as DayOfWeek)) {
      event.day = selection.value as DayOfWeek;
    }

    this.sendEditor(event, selection.interaction, this.onSubmit);
  }

  private async onStartTimeHSelected(event: EventCreateDTO, interaction: ButtonInteraction) {
    const { value, interaction: fetchInteraction } = await this.editorHelpers.fetchText(
      interaction,
      'start-time-h',
      'Input a start time in format HH:MM (UTC)',
      event.startTime,
      TextInputStyle.Short
    );

    const regex = new RegExp(/\d\d:\d\d/);

    const test = regex.test(value);

    if (test) {
      const [hh, mm] = value.split(':');

      const hhInt = parseInt(hh!);
      const mmInt = parseInt(mm!);

      if (hhInt >= 0 && hhInt <= 23 && mmInt >= 0 && mmInt <= 59) {
        event.startTime = value;
      }
    }

    this.sendEditor(event, fetchInteraction, this.onSubmit);
  }

  private async onDurationSelected(event: EventCreateDTO, interaction: ButtonInteraction) {
    const { value, interaction: fetchInteraction } = await this.editorHelpers.fetchText(
      interaction,
      'duration',
      'Input an event duration',
      event.duration,
      TextInputStyle.Short
    );

    this.sendEditor({ ...event, duration: value }, fetchInteraction, this.onSubmit);
  }

  private async onDoneSelected(event: EventCreateDTO, interaction: ButtonInteraction) {
    if (!this.onSubmit) {
      throw new Error('No submit handler');
    }

    const saved = await this.onSubmit(event);

    if (!saved) {
      respond(interaction, { content: 'Failed to save event.' });
      return;
    }

    const embed = this.createEventDetailsEmbed(saved);

    await respond(interaction, {
      content: 'Success!',
      embeds: [embed],
      components: []
    });
  }

  public createEventDetailsEmbed(event: EventCreateDTO) {
    return this.embedCreator.createEmbed(event.day, [event]);
  }
}
