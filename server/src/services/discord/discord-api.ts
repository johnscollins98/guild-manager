import axios, { AxiosRequestConfig } from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import { Service } from 'typedi';
import { init } from '../../axios-logger';
import { config } from '../../config';

const rateLimitedAxios = axiosRateLimit(axios.create(), { maxRequests: 30, perMilliseconds: 1000 });
init(rateLimitedAxios);

@Service()
export class DiscordApi {
  private readonly baseUrl: string;

  constructor(
    private readonly apiKey = config.botToken,
    private readonly isBearer = false
  ) {
    this.baseUrl = `https://discord.com/api`;
  }

  async get<T>(endpoint: string, init?: AxiosRequestConfig): Promise<T> {
    return await this.makeRequest<T>(endpoint, { method: 'get', ...init });
  }

  async put<In, Out>(endpoint: string, body: In, init?: AxiosRequestConfig): Promise<Out> {
    return await this.makeRequestWithBody<In, Out>(endpoint, body, { method: 'put', ...init });
  }

  async post<In, Out>(endpoint: string, body: In, init?: AxiosRequestConfig): Promise<Out> {
    return await this.makeRequestWithBody<In, Out>(endpoint, body, { method: 'post', ...init });
  }

  async patch<In, Out>(endpoint: string, body: In, init?: AxiosRequestConfig): Promise<Out> {
    return await this.makeRequestWithBody<In, Out>(endpoint, body, { method: 'patch', ...init });
  }

  async delete(endpoint: string, init?: AxiosRequestConfig): Promise<boolean> {
    await this.makeRequest(endpoint, { method: 'delete', ...init });
    return true;
  }

  private async makeRequestWithBody<In, Out>(
    endpoint: string,
    body: In,
    init?: AxiosRequestConfig
  ): Promise<Out> {
    return await this.makeRequest<Out>(endpoint, {
      data: JSON.stringify(body),
      ...init
    });
  }

  private async makeRequest<T = unknown>(endpoint: string, init?: AxiosRequestConfig): Promise<T> {
    const response = await rateLimitedAxios({
      headers: {
        Authorization: `${this.isBearer ? 'Bearer' : 'Bot'} ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...init?.headers
      },
      baseURL: this.baseUrl,
      url: endpoint,
      ...init
    });

    return response.data;
  }
}
