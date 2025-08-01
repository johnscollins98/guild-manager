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
import { WarningCreateDTO, WarningDTO } from '../dtos';
import WarningsRepository from '../services/repositories/warnings-repository';
import { IWarningsController } from './interfaces';

@JsonController('/api/warnings', { transformResponse: false })
@Authorized()
@Service()
export class WarningsController implements IWarningsController {
  constructor(private readonly warningRepo: WarningsRepository) {}

  @Get('/')
  getAll(): Promise<WarningDTO[]> {
    return this.warningRepo.getAll({ order: { timestamp: 'ASC' } });
  }

  @Get('/:id')
  @OnNull(404)
  get(@Param('id') id: number): Promise<WarningDTO | null> {
    return this.warningRepo.getById(id);
  }

  @Get('/member/:id')
  getForMember(@Param('id') id: string): Promise<WarningDTO[]> {
    return this.warningRepo.getForMember(id);
  }

  @Delete('/:id')
  @OnUndefined(204)
  @Authorized('WARNINGS')
  async delete(@Param('id') id: number, @CurrentUser() user: Express.User): Promise<void> {
    const res = await this.warningRepo.deleteAndLog(id, user);

    if (!res) {
      throw new NotFoundError('Cannot find warning');
    }
  }

  @Post('/')
  @Authorized('WARNINGS')
  async create(
    @Body() warning: WarningCreateDTO,
    @CurrentUser() user: Express.User
  ): Promise<WarningDTO> {
    return this.warningRepo.createAndLog(warning, user);
  }

  @Put('/:id')
  @Authorized('WARNINGS')
  @OnNull(404)
  async update(
    @Param('id') id: number,
    @Body() warning: WarningCreateDTO,
    @CurrentUser() user: Express.User
  ): Promise<WarningDTO | null> {
    return this.warningRepo.updateAndLog(id, warning, user);
  }
}
