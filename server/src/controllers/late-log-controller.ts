import {
  Authorized,
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  OnUndefined,
  Param,
  Post
} from 'routing-controllers';
import { Service } from 'typedi';
import { LateLogCreateDto } from '../dtos';
import { LateLogDto } from '../dtos/late-log/late-log-dto';
import LateLogRepository from '../services/repositories/late-log-repository';
import { ILateLogController } from './interfaces';

@JsonController('/api/late-log', { transformResponse: false })
@Authorized()
@Service()
export class LateLogController implements ILateLogController {
  constructor(private readonly lateLogRepo: LateLogRepository) {}

  @Get('/')
  getAll(): Promise<LateLogDto[]> {
    return this.lateLogRepo.getAll();
  }

  @Post('/')
  create(
    @Body() lateLogCreateDto: LateLogCreateDto,
    @CurrentUser() user?: Express.User
  ): Promise<LateLogDto> {
    return this.lateLogRepo.create({ ...lateLogCreateDto, givenBy: user?.id });
  }

  @Delete('/:id')
  @OnUndefined(204)
  async delete(@Param('id') id: number): Promise<void> {
    const res = await this.lateLogRepo.delete(id);

    if (!res) {
      throw new NotFoundError('Cannot find late log entry');
    }
  }
}
