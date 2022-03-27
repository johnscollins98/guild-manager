import {
  Authorized,
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put
} from 'routing-controllers';
import { Service } from 'typedi';
import { EventRepository } from '../services/repositories/event.repository';
import { Event } from '../models/event.model';
import { EventPostSettingsRepository } from '../services/repositories/eventpostsettings.repository';
import { config } from '../config';

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
  getGuildSettings() {
    // TODO: Config DI would be ideal
    return this.eventPostSettingsRepo.findOrCreateByGuildId(config.discordGuildId);
  }

  @Get('/')
  getAll() {
    return this.eventRepo.getAll();
  }

  @Get('/:id')
  get(@Param('id') id: string) {
    return this.eventRepo.getById(id);
  }

  @Get('/day/:day')
  getEventsOnADay(@Param('day') day: string) {
    return this.eventRepo.getEventsOnADay(day);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.eventRepo.delete(id);
  }

  @Post('/')
  create(@Body() event: Event) {
    return this.eventRepo.create(event);
  }

  @Put('/:id')
  update(@Param('id') id: string, @Body() event: Event) {
    return this.eventRepo.update(id, event);
  }
}
