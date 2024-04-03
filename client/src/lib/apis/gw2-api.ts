import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import GW2LogEntry from '../interfaces/gw2-log-entry';
import GW2Member from '../interfaces/gw2-member';
import GW2Rank from '../interfaces/gw2-rank';

export const useGW2Members = () => useQuery<GW2Member[], AxiosError>({ queryKey: ['gw2/members'] });
export const useGW2Log = () => useQuery<GW2LogEntry[], AxiosError>({ queryKey: ['gw2/log'] });
export const useGW2Ranks = () => useQuery<GW2Rank[], AxiosError>({ queryKey: ['gw2/ranks'] });

export const usePrefetchGW2Log = (isAuthenticated: boolean) => {
  const queryClient = useQueryClient();

  if (isAuthenticated) {
    queryClient.prefetchQuery({ queryKey: ['gw2/log'] });
  }
};
