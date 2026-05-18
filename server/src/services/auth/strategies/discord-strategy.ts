/** Taken and adapted from https://github.com/nicholastay/passport-discord/blob/master/lib/strategy.js */

import OAuth2Strategy, { InternalOAuthError, StrategyOptions } from 'passport-oauth2';

export interface DiscordProfile {
  id: string;
  username: string;
  avatar?: string;
  provider: string;
  accessToken: string;
  connections?: unknown[];
  guilds?: unknown[];
  fetchedAt: Date;
  [key: string]: unknown;
}

interface AuthorizationParams {
  permissions?: string | number;
  prompt?: string;
}

type VerifyCallback = (err: Error | null, profile?: DiscordProfile | null) => void;

type StrategyOptionsWithOptionalURLs = Omit<
  StrategyOptions,
  'authorizationURL' | 'tokenURL' | 'scopeSeparator'
> & {
  authorizationURL?: string;
  tokenURL?: string;
  scopeSeparator?: string;
};

class DiscordStrategy extends OAuth2Strategy {
  constructor(options: StrategyOptionsWithOptionalURLs, verify: OAuth2Strategy.VerifyFunction) {
    const strategyOptions: StrategyOptions = {
      ...options,
      authorizationURL: options.authorizationURL ?? 'https://discord.com/api/oauth2/authorize',
      tokenURL: options.tokenURL ?? 'https://discord.com/api/oauth2/token',
      scopeSeparator: options.scopeSeparator ?? ' '
    };

    super(strategyOptions, verify);
    this.name = 'discord';
    this._oauth2.useAuthorizationHeaderforGET(true);
  }

  /**
   * Retrieve user profile from Discord.
   *
   * This function constructs a normalized profile.
   * Along with the properties returned from /users/@me, properties returned include:
   *   - `connections`      Connections data if you requested this scope
   *   - `guilds`           Guilds data if you requested this scope
   *   - `fetchedAt`        When the data was fetched as a `Date`
   *   - `accessToken`      The access token used to fetch the (may be useful for refresh)
   *
   * @param accessToken - The access token to use for API calls
   * @param done - Callback function with error or profile
   */
  userProfile(accessToken: string, done: VerifyCallback): void {
    this._oauth2.get(
      'https://discord.com/api/users/@me',
      accessToken,
      (err: unknown, body?: string | unknown) => {
        if (err) {
          return done(new InternalOAuthError('Failed to fetch the user profile.', err as Error));
        }

        try {
          const parsedData: Record<string, unknown> =
            typeof body === 'string' ? JSON.parse(body) : (body as Record<string, unknown>);

          const profile: DiscordProfile = {
            ...(parsedData as DiscordProfile),
            provider: 'discord',
            accessToken
          };

          this.checkScope(
            'connections',
            accessToken,
            (errx: unknown, connections?: unknown[] | null) => {
              if (errx) {
                return done(errx as Error);
              }
              if (connections) {
                profile.connections = connections;
              }

              this.checkScope('guilds', accessToken, (erry: unknown, guilds?: unknown[] | null) => {
                if (erry) {
                  return done(erry as Error);
                }
                if (guilds) {
                  profile.guilds = guilds;
                }

                profile.fetchedAt = new Date();
                return done(null, profile);
              });
            }
          );
        } catch {
          return done(new Error('Failed to parse the user profile.'));
        }
      }
    );
  }

  /**
   * Check if a specific scope was requested and fetch its data.
   *
   * @param scope - The scope to check (e.g., 'connections', 'guilds')
   * @param accessToken - The access token to use for API calls
   * @param cb - Callback function with error or scope data
   */
  checkScope(
    scope: string,
    accessToken: string,
    cb: (err: unknown, data?: unknown[] | null) => void
  ): void {
    const parentScope = (this as unknown as Record<string, unknown>)._scope as string | undefined;
    if (parentScope && parentScope.indexOf(scope) !== -1) {
      this._oauth2.get(
        `https://discord.com/api/users/@me/${scope}`,
        accessToken,
        (err: unknown, body?: string | unknown) => {
          if (err) {
            return cb(new InternalOAuthError(`Failed to fetch user's ${scope}`, err as Error));
          }
          try {
            const json: unknown[] =
              typeof body === 'string' ? JSON.parse(body) : (body as unknown[]);
            cb(null, json);
          } catch {
            return cb(new Error(`Failed to parse user's ${scope}`));
          }
        }
      );
    } else {
      cb(null, null);
    }
  }

  /**
   * Return extra parameters to be included in the authorization request.
   *
   * @param options - Authorization options containing permissions and prompt
   * @returns Object with authorization parameters
   */
  authorizationParams(options: AuthorizationParams): Record<string, string | number> {
    const params = super.authorizationParams(options) as Record<string, string | number>;

    if (options.permissions !== undefined) {
      params.permissions = options.permissions;
    }
    if (options.prompt !== undefined) {
      params.prompt = options.prompt;
    }

    return params;
  }
}

export default DiscordStrategy;
