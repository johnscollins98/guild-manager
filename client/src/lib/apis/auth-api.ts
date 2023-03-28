import axios, { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import AuthInfo from '../interfaces/auth-info';

export const useAuth = () =>
  useQuery<AuthInfo, AxiosError>('auth/authorization', async () => {
    const response = await axios.get('/auth/authorization');
    return response.data;
  });

export const useAdminRoles = () =>
  useQuery<string[], AxiosError>('auth/admin_roles', async () => {
    const response = await axios.get('/auth/admin_roles');
    return response.data;
  });

export const useEventRoles = () =>
  useQuery<string[], AxiosError>('auth/event_roles', async () => {
    const response = await axios.get('/auth/event_roles');
    return response.data;
  });
