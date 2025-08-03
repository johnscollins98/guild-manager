import axios, { type AxiosRequestConfig } from 'axios';

export const createApi = (baseUrl: string) => {
  return async <TRes>(url: string, config?: AxiosRequestConfig): Promise<TRes> => {
    return (await axios<TRes>(`${baseUrl}/${url}`, { ...config, baseURL: '/' })).data;
  };
};
