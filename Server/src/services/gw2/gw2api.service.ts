import { Service } from 'typedi';
import { config } from '../../config';
import fetch from 'node-fetch';

@Service()
export class GW2Api {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  constructor() {
    this.baseUrl = "https://api.guildwars2.com/v2";
    this.apiKey = config.gw2apiToken;
  }

  async get<T>(endpoint: string) : Promise<T> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      headers: {
        "Authorization": `Bearer ${this.apiKey}`
      }
    });
    const data: T = await response.json();
    return data;
  }
}