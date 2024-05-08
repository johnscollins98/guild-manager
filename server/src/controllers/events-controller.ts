import {
  Authorized,
  Body,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  OnNull,
  OnUndefined,
  Param,
  Post,
  Put
} from 'routing-controllers';
import { Service } from 'typedi';
import { config } from '../config';
import { EventPostSettings } from '../models/event-post-settings.model';
import { Event } from '../models/event.model';
import { EventPostSettingsRepository } from '../services/repositories/event-post-settings-repository';
import { EventRepository } from '../services/repositories/event-repository';

@JsonController('/api/events', { transformResponse: false })
@Authorized()
@Service()
export class EventsController {
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly eventPostSettingsRepo: EventPostSettingsRepository // TODO: Temporary
  ) {}

  // TODO: To be moved -- here for backwards compatability
  @Get('/settings')
  getGuildSettings(): Promise<EventPostSettings> {
    // TODO: Config DI would be ideal
    return this.eventPostSettingsRepo.findOrCreateByGuildId(config.discordGuildId);
  }

  @Get('/')
  getAll(): Promise<Event[]> {
    return this.eventRepo.getAll();
  }

  @Get('/:id')
  @OnNull(404)
  get(@Param('id') id: number): Promise<Event | null> {
    return this.eventRepo.getById(id);
  }

  @Get('/day/:day')
  getEventsOnADay(@Param('day') day: string): Promise<Event[]> {
    return this.eventRepo.getEventsOnADay(day);
  }

  @Delete('/:id')
  @OnUndefined(204)
  async delete(@Param('id') id: number): Promise<undefined> {
    const res = await this.eventRepo.delete(id);

    if (!res) {
      throw new NotFoundError('Event not found');
    }
  }

  @Post('/')
  create(@Body() event: Event): Promise<Event> {
    return this.eventRepo.create(event);
  }

  @Put('/:id')
  @OnNull(404)
  update(@Param('id') id: number, @Body() event: Event): Promise<Event | null> {
    return this.eventRepo.update(id, event);
  }
}
