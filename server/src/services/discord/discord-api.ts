import { InternalRequest, RequestData, RequestMethod, REST, RouteLike } from 'discord.js';
import { DateTime } from 'luxon';
import { Service } from 'typedi';
import { config } from '../../config';

@Service()
export class DiscordApi {
  private readonly rest: REST;

  constructor(apiKey = config.botToken, isBearer = false) {
    this.rest = new REST({ authPrefix: isBearer ? 'Bearer' : 'Bot' });
    this.rest.setToken(apiKey);
  }

  async get<T>(fullRoute: RouteLike, init?: RequestData): Promise<T> {
    return (await this.makeRequest({ method: RequestMethod.Get, fullRoute, ...init })) as T;
  }

  async put<In, Out>(fullRoute: RouteLike, body: In, init?: RequestData): Promise<Out> {
    return (await this.makeRequest({
      method: RequestMethod.Put,
      fullRoute,
      body,
      ...init
    })) as Out;
  }

  async post<In, Out>(fullRoute: RouteLike, body: In, init?: RequestData): Promise<Out> {
    return (await this.makeRequest({
      method: RequestMethod.Post,
      fullRoute,
      body,
      ...init
    })) as Out;
  }

  async patch<In, Out>(fullRoute: RouteLike, body: In, init?: RequestData): Promise<Out> {
    return (await this.makeRequest({
      method: RequestMethod.Patch,
      fullRoute,
      body,
      ...init
    })) as Out;
  }

  async delete(fullRoute: RouteLike, init?: RequestData): Promise<boolean> {
    await this.makeRequest({
      method: RequestMethod.Delete,
      fullRoute,
      ...init
    });
    return true;
  }

  private async makeRequest<TOut>(request: InternalRequest): Promise<TOut> {
    const blue = '\x1b[34m';
    const yellow = '\x1b[33m';
    const white = '\x1b[37m';
    const dateFormat = 'yyyy-LL-dd TT';

    const methodString = `${yellow}${request.method}`;
    const routeString = `${white}${request.fullRoute}`;
    const dateString = () => `${white}[${DateTime.now().toFormat(dateFormat)}]`;
    const prefix = (reqStr: string) => `${blue}[Discord][${reqStr}]`;

    console.info(`${prefix('Request')} ${dateString()} ${methodString} ${routeString}`);

    const res = await this.rest.request(request);

    console.info(`${prefix('Response')} ${dateString()} ${methodString} ${routeString} Success!`);

    return res as TOut;
  }
}
