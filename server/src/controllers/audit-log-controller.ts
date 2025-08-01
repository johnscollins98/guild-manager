import { Authorized, Get, JsonController, QueryParam } from 'routing-controllers';
import { Service } from 'typedi';
import { AuditLogRepository } from '../services/repositories/audit-log-repository';
import { IAuditLogController } from './interfaces/audit-log-interface';

@JsonController('/api/audit-log', { transformResponse: false })
@Authorized()
@Service()
export class AuditLogController implements IAuditLogController {
  constructor(private readonly auditLogRepo: AuditLogRepository) {}

  @Get('/')
  getAll(@QueryParam('limit', { required: false }) limit: number = 100) {
    return this.auditLogRepo.getAll({ take: limit, order: { timestamp: 'desc' } });
  }
}
