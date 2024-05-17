import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type IGW2Controller } from 'server';
import { createApi } from './axios-wrapper';

const api = createApi('/api/gw2');

const gw2Api: IGW2Controller = {
  getLog: () => api('log'),
  getMembers: () => api('members'),
  getRanks: () => api('ranks')
};

export const useGW2Members = () =>
  useQuery({ queryKey: ['gw2/members'], queryFn: gw2Api.getMembers });
export const useGW2Log = () => useQuery({ queryKey: ['gw2/log'], queryFn: gw2Api.getLog });
export const useGW2Ranks = () => useQuery({ queryKey: ['gw2/ranks'], queryFn: gw2Api.getRanks });

export const usePrefetchGW2Log = (isAuthenticated: boolean) => {
  const queryClient = useQueryClient();

  if (isAuthenticated) {
    queryClient.prefetchQuery({ queryKey: ['gw2/log'], queryFn: gw2Api.getLog });
  }
};
