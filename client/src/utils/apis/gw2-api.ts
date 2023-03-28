import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import GW2LogEntry from '../../interfaces/GW2LogEntry';
import GW2Member from '../../interfaces/GW2Member';
import GW2Rank from '../../interfaces/GW2Rank';

export const useGW2Members = () => useQuery<GW2Member[], AxiosError>('gw2/members');
export const useGW2Log = () => useQuery<GW2LogEntry[], AxiosError>('gw2/log');
export const useGW2Ranks = () => useQuery<GW2Rank[], AxiosError>('gw2/ranks');
