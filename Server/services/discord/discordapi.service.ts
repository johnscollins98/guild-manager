import { HttpError } from 'routing-controllers';
import { Service } from 'typedi';
import { config } from '../../config';
import fetch, { RequestInit } from 'node-fetch';

@Service()
export class DiscordApi {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = config.botToken;
    this.baseUrl = `https://discord.com/api`;
  }

  async get<T>(endpoint: string, init?: RequestInit): Promise<T> {
    return await this.makeRequest<T>(endpoint, { method: 'get', ...init });
  }

  async put<In, Out>(endpoint: string, body: In, init?: RequestInit): Promise<Out> {
    return await this.makeRequestWithBody<In, Out>(endpoint, body, { method: 'put', ...init });
  }

  async post<In, Out>(endpoint: string, body: In, init?: RequestInit): Promise<Out> {
    return await this.makeRequestWithBody<In, Out>(endpoint, body, { method: 'post', ...init });
  }

  async patch<In, Out>(endpoint: string, body: In, init?: RequestInit): Promise<Out> {
    return await this.makeRequestWithBody<In, Out>(endpoint, body, { method: 'patch', ...init });
  }

  async delete(endpoint: string, init?: RequestInit): Promise<boolean> {
    await this.makeRequest(endpoint, { method: 'delete', ...init });
    return true;
  }

  private async makeRequestWithBody<In, Out>(
    endpoint: string,
    body: In,
    init?: RequestInit
  ): Promise<Out> {
    return await this.makeRequest<Out>(endpoint, {
      body: JSON.stringify(body),
      ...init
    });
  }

  private async makeRequest<T>(endpoint: string, init?: RequestInit): Promise<T | any> {
    const defInit: RequestInit = {
      headers: {
        Authorization: `Bot ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await fetch(`${this.baseUrl}/${endpoint}`, { ...defInit, ...init });
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }

    return await response.json().catch(() => {});
  }
}
