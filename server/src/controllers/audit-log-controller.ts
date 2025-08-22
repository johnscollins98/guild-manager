import { Authorized, Get, JsonController, QueryParam } from 'routing-controllers';
import { Service } from 'typedi';
import { LessThan } from 'typeorm';
import { AuditLogRepository } from '../services/repositories/audit-log-repository';
import { IAuditLogController } from './interfaces/audit-log-interface';

@JsonController('/api/audit-log', { transformResponse: false })
@Authorized()
@Service()
export class AuditLogController implements IAuditLogController {
  constructor(private readonly auditLogRepo: AuditLogRepository) {}

  @Get('/')
  getAll(
    @QueryParam('limit', { required: false }) limit: number = 100,
    @QueryParam('before', { required: false }) before?: Date
  ) {
    console.log(before);
    return this.auditLogRepo.getAll({
      take: limit,
      where: before ? { timestamp: LessThan(new Date(before)) } : undefined,
      order: { timestamp: 'desc' }
    });
  }
}
