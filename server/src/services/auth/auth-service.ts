import cache from 'memory-cache';
import Container, { Service } from 'typedi';
import { config } from '../../config';
import { AuthInfo, DiscordMember, Permission, PermissionsDTO } from '../../dtos';
import { DiscordGuildApi } from '../discord/guild-api';

const notLoggedIn: AuthInfo = {
  loggedIn: false,
  username: '',
  roles: [],
  permissions: {
    ACCESS: false,
    EVENTS: false,
    MEMBERS: false,
    RECRUITMENT: false,
    WARNINGS: false
  }
};

const skipAuth: AuthInfo = {
  loggedIn: true,
  username: 'dev',
  roles: config.accessRoles,
  permissions: {
    ACCESS: true,
    EVENTS: true,
    MEMBERS: true,
    RECRUITMENT: true,
    WARNINGS: true
  }
};

@Service()
export class AuthService {
  constructor() {}

  async getUserAuthInfo(userId?: string): Promise<AuthInfo> {
    if (process.env.NODE_ENV === 'development' && config.skipAuth) {
      return skipAuth;
    }

    if (!userId) return notLoggedIn;

    const loggedIn = true;

    const cacheKey = `discord-member/${config.discordGuildId}/${userId}`;
    let cachedMember: Promise<DiscordMember | undefined> | null = cache.get(cacheKey);
    try {
      if (!cachedMember) {
        const guildApi = Container.get(DiscordGuildApi);
        cachedMember = guildApi.getMemberById(userId);
        cache.put(cacheKey, cachedMember, 10000);
      }
    } catch (err) {
      console.error(err);
    }

    const member = await cachedMember;

    const username = member?.user?.username;
    const roles = member?.roles ?? [];

    return {
      loggedIn,
      username: username ?? 'Unknown',
      roles,
      permissions: this.getPermissions(roles)
    };
  }

  checkPermissions(user: AuthInfo, roles: Permission[] = []) {
    const hasPermission =
      user.permissions.ACCESS && roles.every(r => user.permissions[r as Permission]);

    return user.loggedIn && hasPermission;
  }

  async checkPermissionsWithId(userId?: string, roles: Permission[] = []) {
    const user = await this.getUserAuthInfo(userId);
    return this.checkPermissions(user, roles);
  }

  getPermissions(userRoles: string[]): PermissionsDTO {
    return {
      ACCESS: this.hasRequiredRoles(config.accessRoles, userRoles),
      EVENTS: this.hasRequiredRoles(config.eventRoles, userRoles),
      MEMBERS: this.hasRequiredRoles(config.manageMembersRoles, userRoles),
      RECRUITMENT: this.hasRequiredRoles(config.manageRecruitmentRoles, userRoles),
      WARNINGS: this.hasRequiredRoles(config.manageWarningsRoles, userRoles)
    };
  }

  private hasRequiredRoles(requiredRoles: string[], userRoles: string[]) {
    if (requiredRoles.length === 0) return false;
    return requiredRoles.some(r => userRoles.includes(r));
  }
}
