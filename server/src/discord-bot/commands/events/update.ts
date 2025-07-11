import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Service } from 'typedi';
import { Permission } from '../../../dtos';
import { EventRepository } from '../../../services/repositories/event-repository';
import { Command } from '../../command-gatherer';
import { EventEditor } from '../../services/event-editor';
import { EventSelector } from '../../services/events/event-selector';

@Service()
export default class EventsDeleteCommand implements Command {
  public readonly name: string;

  constructor(
    private readonly eventSelector: EventSelector,
    private readonly eventEditor: EventEditor,
    private readonly eventsRepo: EventRepository
  ) {
    this.name = 'events-update';
  }

  async getConfig() {
    return new SlashCommandBuilder().setName(this.name).setDescription('Update an event');
  }

  getRequiredPermissions(): Permission[] {
    return ['EVENTS'];
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const eventSelection = await this.eventSelector.selectEvent(interaction);

    if (!eventSelection) return;

    if (!eventSelection.value) {
      throw new Error('No event id provided.');
    }

    const event = await this.eventsRepo.getById(parseInt(eventSelection.value));

    if (!event) {
      throw new Error("Event doesn't exist");
    }

    this.eventEditor.sendEditor(event, eventSelection.interaction, e =>
      this.eventsRepo.update(e.id!, e)
    );
  }
}
