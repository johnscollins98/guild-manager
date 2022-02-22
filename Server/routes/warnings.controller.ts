import { Body, Delete, Get, JsonController, Param, Post, Put, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import Warning from '../interfaces/warning.interface';
import { isAdmin } from '../middleware/auth.middleware';
import WarningsRepository from '../repositories/warnings.repository';

@JsonController('/api/warnings')
@Service()
export class WarningsController {
  constructor(private readonly warningRepo: WarningsRepository) {}

  @Get('/')
  getAll() {
    return this.warningRepo.getAll();
  }

  @Get('/:id')
  get(@Param('id') id: string) {
    return this.warningRepo.get(id);
  }

  @Get('/member/:id')
  getForMember(@Param('id') id: string) {
    return this.warningRepo.getForMember(id);
  }

  @Delete('/:id')
  @UseBefore(isAdmin)
  delete(@Param('id') id: string) {
    return this.warningRepo.delete(id);
  }

  @Post('/')
  @UseBefore(isAdmin)
  create(@Body() warning: Warning) {
    return this.warningRepo.create(warning);
  }

  @Put('/:id')
  @UseBefore(isAdmin)
  update(@Param('id') id: string, @Body() warning: Warning) {
    return this.warningRepo.update(id, warning);
  }
}
