import { Action } from './action';

export interface AuditLogEntry {
  id: number;

  timestamp: Date;
  sourceUserId: string;
  sourceUsername: string;

  targetUserId?: string;
  targetUsername?: string;

  eventId?: number;

  warningId?: number;

  roleId?: string;

  gw2AccountName?: string;

  nick?: string;

  action: Action;
}
