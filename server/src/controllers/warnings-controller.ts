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
import { Warning } from '../models/warning.model';
import WarningsRepository from '../services/repositories/warnings-repository';

@JsonController('/api/warnings', { transformResponse: false })
@Authorized()
@Service()
export class WarningsController {
  constructor(private readonly warningRepo: WarningsRepository) {}

  @Get('/')
  getAll(): Promise<Warning[]> {
    return this.warningRepo.getAll();
  }

  @Get('/:id')
  @OnNull(404)
  get(@Param('id') id: number): Promise<Warning | null> {
    return this.warningRepo.getById(id);
  }

  @Get('/member/:id')
  getForMember(@Param('id') id: string): Promise<Warning[]> {
    return this.warningRepo.getForMember(id);
  }

  @Delete('/:id')
  @OnUndefined(204)
  async delete(@Param('id') id: number): Promise<undefined> {
    const res = await this.warningRepo.delete(id);

    if (!res) {
      throw new NotFoundError('Cannot find warning');
    }
  }

  @Post('/')
  create(@Body() warning: Warning, @CurrentUser() user: Express.User): Promise<Warning> {
    warning.givenBy = user.username;
    return this.warningRepo.create(warning);
  }

  @Put('/:id')
  @OnNull(404)
  update(@Param('id') id: number, @Body() warning: Warning): Promise<Warning | null> {
    return this.warningRepo.update(id, warning);
  }
}
