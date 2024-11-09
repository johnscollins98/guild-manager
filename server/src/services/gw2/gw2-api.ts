import axios from 'axios';
import { Service } from 'typedi';
import { config } from '../../config';

@Service()
export class GW2Api {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  constructor() {
    this.baseUrl = 'https://api.guildwars2.com/v2';
    this.apiKey = config.gw2apiToken;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await axios.get(endpoint, {
      params: {
        access_token: this.apiKey
      },
      baseURL: this.baseUrl
    });

    return response.data;
  }
}
