import {
  Authorized,
  Body,
  CurrentUser,
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
import { DayOfWeek, EventCreateDTO, EventDTO, EventSettingsDTO } from '../dtos';
import { EventPostSettingsRepository } from '../services/repositories/event-post-settings-repository';
import { EventRepository } from '../services/repositories/event-repository';
import { IEventsController } from './interfaces';

@JsonController('/api/events', { transformResponse: false })
@Authorized()
@Service()
export class EventsController implements IEventsController {
  constructor(
    private readonly eventRepo: EventRepository,
    private readonly eventPostSettingsRepo: EventPostSettingsRepository // TODO: Temporary
  ) {}

  // TODO: To be moved -- here for backwards compatability
  @Get('/settings')
  async getGuildSettings(): Promise<EventSettingsDTO> {
    // TODO: Config DI would be ideal
    const model = await this.eventPostSettingsRepo.findOrCreateByGuildId(config.discordGuildId);
    return {
      channelId: model.channelId,
      editMessages: model.editMessages,
      messageId: model.messageId
    };
  }

  @Get('/')
  getAll(): Promise<EventDTO[]> {
    return this.eventRepo.getAll();
  }

  @Get('/:id')
  @OnNull(404)
  get(@Param('id') id: number): Promise<EventDTO | null> {
    return this.eventRepo.getById(id);
  }

  @Get('/day/:day')
  getEventsOnADay(@Param('day') day: DayOfWeek): Promise<EventDTO[]> {
    return this.eventRepo.getEventsOnADay(day);
  }

  @Delete('/:id')
  @Authorized('EVENTS')
  @OnUndefined(204)
  async delete(@Param('id') id: number, @CurrentUser() user: Express.User): Promise<void> {
    const res = await this.eventRepo.deletedAndLog(user, id);
    if (!res) {
      throw new NotFoundError('Event not found');
    }
  }

  @Post('/')
  @Authorized('EVENTS')
  async create(
    @Body() event: EventCreateDTO,
    @CurrentUser() user: Express.User
  ): Promise<EventDTO> {
    return this.eventRepo.createAndLog(user, event);
  }

  @Put('/:id')
  @Authorized('EVENTS')
  @OnNull(404)
  async update(
    @Param('id') id: number,
    @Body() event: EventCreateDTO,
    @CurrentUser() user: Express.User
  ): Promise<EventDTO | null> {
    return this.eventRepo.updateAndLog(user, id, event);
  }
}
