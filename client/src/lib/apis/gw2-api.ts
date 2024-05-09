import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FormattedLogEntry, GW2Member, type GW2ControllerApi, type GW2Rank } from 'server';

const gw2Api: GW2ControllerApi = {
  getLog: async () => (await axios.get<FormattedLogEntry[]>('/api/gw2/log')).data,
  getMembers: async () => (await axios.get<GW2Member[]>('/api/gw2/members')).data,
  getRanks: async () => (await axios.get<GW2Rank[]>('/api/gw2/ranks')).data
};

export const useGW2Members = () =>
  useQuery({ queryKey: ['gw2/members'], queryFn: gw2Api.getMembers });
export const useGW2Log = () => useQuery({ queryKey: ['gw2/log'], queryFn: gw2Api.getLog });
export const useGW2Ranks = () => useQuery({ queryKey: ['gw2/ranks'], queryFn: gw2Api.getRanks });

export const usePrefetchGW2Log = (isAuthenticated: boolean) => {
  const queryClient = useQueryClient();

  if (isAuthenticated) {
    queryClient.prefetchQuery({ queryKey: ['gw2/log'] });
  }
};
