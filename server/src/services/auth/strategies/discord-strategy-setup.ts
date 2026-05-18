import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import { Service } from 'typedi';
import { config } from '../../../config';
import { JWTService } from '../jwt-service';
import DiscordStrategy, { DiscordProfile } from './discord-strategy';

@Service()
export class DiscordStrategySetup {
  constructor(private readonly jwtService: JWTService) {
    // Store PKCE state for later verification
    passport.use(
      new DiscordStrategy(
        {
          clientID: config.discordClientId,
          clientSecret: config.discordClientSecret,
          callbackURL: config.discordAuthRedirect,
          pkce: true,
          state: true,
          scope: ['identify', 'guilds.members.read']
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          params: { expires_in: number },
          profile: DiscordProfile,
          done: OAuth2Strategy.VerifyCallback
        ) => {
          try {
            // Generate JWT token (expires in 24 hours)
            const token = this.jwtService.signToken(
              profile.id,
              profile.username,
              params.expires_in
            );

            const user = {
              id: profile.id,
              username: profile.username,
              expires: new Date(Date.now() + params.expires_in * 1000),
              token
            } satisfies Express.User;

            done(null, user);
          } catch (err) {
            console.error(err);
            done(err instanceof Error ? err : null, undefined);
          }
        }
      )
    );
  }
}
