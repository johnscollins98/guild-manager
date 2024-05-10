import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { IAuthController } from 'server';
import { createApi } from './axios-wrapper';

const api = createApi('auth');

const authApi: IAuthController = {
  getAuthorization: () => api('authorization'),
  getAdminRoles: () => api('admin_roles'),
  getEventRoles: () => api('event_roles')
};

export const useAuth = () =>
  useQuery({
    queryKey: ['auth/authorization'],
    queryFn: authApi.getAuthorization
  });

export const useAdminRoles = () =>
  useQuery<string[], AxiosError>({
    queryKey: ['auth/admin_roles'],
    queryFn: authApi.getAdminRoles
  });

export const useEventRoles = () =>
  useQuery<string[], AxiosError>({
    queryKey: ['auth/event_roles'],
    queryFn: authApi.getEventRoles
  });
