import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Service } from 'typedi';
import { Permission } from '../../../dtos';
import { EventRepository } from '../../../services/repositories/event-repository';
import { Command } from '../../command-gatherer';
import { EventSelector } from '../../services/events/event-selector';

@Service()
export default class EventsDeleteCommand implements Command {
  public readonly name: string;

  constructor(
    private readonly eventSelector: EventSelector,
    private readonly eventsRepo: EventRepository
  ) {
    this.name = 'events-delete';
  }

  async getConfig() {
    return new SlashCommandBuilder().setName(this.name).setDescription('Delete an event');
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

    const deleted = await this.eventsRepo.delete(parseInt(eventSelection.value));

    if (deleted) {
      eventSelection.interaction.update({ content: 'Successfully deleted event.', components: [] });
    } else {
      eventSelection.interaction.update({
        content: 'Failed to delete event, please try again.',
        components: []
      });
    }
  }
}
