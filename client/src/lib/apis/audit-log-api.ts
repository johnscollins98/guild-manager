import { type IAuditLogController } from 'server';
import { createApi } from './axios-wrapper';

const api = createApi('/api/audit-log');

const auditLogApi: IAuditLogController = {
  getAll: (limit?: number, before?: Date) => {
    const queryParams = new URLSearchParams();

    if (limit) {
      queryParams.set('limit', limit.toString());
    }

    if (before) {
      queryParams.set('before', before.toISOString());
    }

    return api(`?${queryParams.toString()}`);
  }
};

export const auditLogQuery = (limit?: number, before?: Date) => ({
  queryKey: ['audit-log'],
  queryFn: () => auditLogApi.getAll(limit, before)
});
