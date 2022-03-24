import {
  Authorized,
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put
} from 'routing-controllers';
import { Service } from 'typedi';
import { Warning } from '../models/warning.model';
import WarningsRepository from '../services/repositories/warnings.repository';

@JsonController('/api/warnings', { transformResponse: false })
@Service()
export class WarningsController {
  constructor(private readonly warningRepo: WarningsRepository) {}

  @Get('/')
  getAll() {
    return this.warningRepo.getAll();
  }

  @Get('/:id')
  get(@Param('id') id: string) {
    return this.warningRepo.getById(id);
  }

  @Get('/member/:id')
  getForMember(@Param('id') id: string) {
    return this.warningRepo.getForMember(id);
  }

  @Delete('/:id')
  @Authorized()
  delete(@Param('id') id: string) {
    return this.warningRepo.delete(id);
  }

  @Post('/')
  @Authorized()
  create(@Body() warning: Warning, @CurrentUser() user: Express.User) {
    warning.givenBy = user.username;
    return this.warningRepo.create(warning);
  }

  @Put('/:id')
  @Authorized()
  update(@Param('id') id: string, @Body() warning: Warning) {
    return this.warningRepo.update(id, warning);
  }
}
