import { useQuery } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { type IAuthController } from 'server';
import { createApi } from './axios-wrapper';

const api = createApi('auth');

const authApi: IAuthController = {
  getAuthorization: () => api('authorization'),
  getEventRoles: () => api('event_roles')
};

export const useAuth = () =>
  useQuery({
    queryKey: ['auth/authorization'],
    queryFn: authApi.getAuthorization
  });

export const useEventRoles = () =>
  useQuery<string[], AxiosError>({
    queryKey: ['auth/event_roles'],
    queryFn: authApi.getEventRoles
  });
