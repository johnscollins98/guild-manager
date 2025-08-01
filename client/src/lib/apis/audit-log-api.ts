import { useSuspenseQuery } from '@tanstack/react-query';
import { type IAuditLogController } from 'server';
import { createApi } from './axios-wrapper';

const api = createApi('/api/audit-log');

const auditLogApi: IAuditLogController = {
  getAll: (limit?: number) => {
    const queryParams = new URLSearchParams();

    if (limit) {
      queryParams.set('limit', limit.toString());
    }

    return api(`?${queryParams.toString()}`);
  }
};

export const auditLogQuery = (limit?: number) => ({
  queryKey: ['audit-log'],
  queryFn: () => auditLogApi.getAll(limit)
});
export const useAuditLog = (limit?: number) => useSuspenseQuery(auditLogQuery(limit));
