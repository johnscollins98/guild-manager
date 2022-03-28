import { Service } from 'typedi';
import { config } from '../../config';
import fetch from 'node-fetch';
import { HttpError } from 'routing-controllers';

@Service()
export class GW2Api {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  constructor() {
    this.baseUrl = 'https://api.guildwars2.com/v2';
    this.apiKey = config.gw2apiToken;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const message = response.statusText;
      throw new HttpError(500, `Error getting gw2 data: (${response.status}) ${message}`);
    }

    const data: T = await response.json();
    return data;
  }
}
