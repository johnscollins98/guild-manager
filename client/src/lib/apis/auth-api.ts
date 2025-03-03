import { useSuspenseQuery } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { type IAuthController } from 'server';
import { createApi } from './axios-wrapper';

const api = createApi('auth');

const authApi: IAuthController = {
  getAuthorization: () => api('authorization'),
  getEventRoles: () => api('event_roles')
};

export const authQuery = {
  queryKey: ['auth/authorization'],
  queryFn: authApi.getAuthorization
};
export const useAuth = () => useSuspenseQuery(authQuery);

export const eventRolesQuery = {
  queryKey: ['auth/event_roles'],
  queryFn: authApi.getEventRoles
};
export const useEventRoles = () => useSuspenseQuery<string[], AxiosError>(eventRolesQuery);
