import { AuditLogEntry } from '../../dtos/audit-log/audit-log-entry';

export interface IAuditLogController {
  getAll(limit?: number): Promise<AuditLogEntry[]>;
}
