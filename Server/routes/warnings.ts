import { Body, Controller, Delete, Get, Param, Post, Put, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import Warning from '../interfaces/Warning';
import { isAdmin } from '../middleware/auth';
import WarningsRepository from '../repositories/warnings.repository';

@Controller('/api/warnings')
@Service()
export class WarningsController {
  constructor(private readonly warningRepo: WarningsRepository) {}

  @Get('/')
  async getAll() {
    return await this.warningRepo.getAll();
  }

  @Get('/:id')
  async get(@Param('id') id: string) {
    return await this.warningRepo.get(id);
  }

  @Get('/member/:id')
  async getForMember(@Param('id') id: string) {
    return await this.warningRepo.getForMember(id);
  }

  @Delete('/:id')
  @UseBefore(isAdmin)
  async delete(@Param('id') id: string) {
    return await this.warningRepo.delete(id);
  }

  @Post('/')
  @UseBefore(isAdmin)
  async create(@Body() warning: Warning) {
    return await this.warningRepo.create(warning);
  }

  @Put('/:id')
  @UseBefore(isAdmin)
  async update(@Param('id') id: string, @Body() warning: Warning) {
    return await this.warningRepo.update(id, warning);
  }
}
