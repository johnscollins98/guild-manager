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
    return this.warningRepo.getAll();
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
  async delete(@Param('id') id: number): Promise<void> {
    const res = await this.warningRepo.delete(id);

    if (!res) {
      throw new NotFoundError('Cannot find warning');
    }
  }

  @Post('/')
  create(
    @Body() warning: WarningCreateDTO,
    @CurrentUser() user?: Express.User
  ): Promise<WarningDTO> {
    return this.warningRepo.create({ ...warning, givenBy: user?.id });
  }

  @Put('/:id')
  @OnNull(404)
  update(@Param('id') id: number, @Body() warning: WarningCreateDTO): Promise<WarningDTO | null> {
    return this.warningRepo.update(id, warning);
  }
}
