import { AuditLogEntry } from '../../dtos/audit-log/audit-log-entry';

export interface IAuditLogController {
  getAll(limit?: number, before?: Date): Promise<AuditLogEntry[]>;
}
