import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import AuthInfo from '../interfaces/auth-info';

export const useAuth = () =>
  useQuery<AuthInfo, AxiosError>({
    queryKey: ['auth/authorization'],
    queryFn: async () => {
      const response = await axios.get('/auth/authorization');
      return response.data;
    }
  });

export const useAdminRoles = () =>
  useQuery<string[], AxiosError>({
    queryKey: ['auth/admin_roles'],
    queryFn: async () => {
      const response = await axios.get('/auth/admin_roles');
      return response.data;
    }
  });

export const useEventRoles = () =>
  useQuery<string[], AxiosError>({
    queryKey: ['auth/event_roles'],
    queryFn: async () => {
      const response = await axios.get('/auth/event_roles');
      return response.data;
    }
  });
