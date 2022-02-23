import { Request } from 'express';
import { Body, Delete, ForbiddenError, Get, JsonController, Param, Post, Put, Req, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { isAdmin } from '../middleware/auth.middleware';
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
  @UseBefore(isAdmin)
  delete(@Param('id') id: string) {
    return this.warningRepo.delete(id);
  }

  @Post('/')
  @UseBefore(isAdmin)
  create(@Body() warning: Warning, @Req() req: Request) {
    if (req.user) {
      warning.givenBy = req.user?.username;
    } else {
      throw new ForbiddenError();
    }
    return this.warningRepo.create(warning);
  }

  @Put('/:id')
  @UseBefore(isAdmin)
  update(@Param('id') id: string, @Body() warning: Warning) {
    return this.warningRepo.update(id, warning);
  }
}
