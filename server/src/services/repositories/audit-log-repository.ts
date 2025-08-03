import cache from 'memory-cache';
import { Service } from 'typedi';
import { dataSource } from '../../dataSource';
import { DiscordMember } from '../../dtos';
import { Action } from '../../dtos/audit-log/action';
import { AuditLog } from '../../models/audit-log.model';
import { DiscordApiFactory } from '../discord/api-factory';
import { IDiscordGuildApi } from '../discord/guild-api';
import { BaseRepository } from './base-repository';

interface SourceUser {
  id: string;
  username: string;
}

@Service()
export class AuditLogRepository extends BaseRepository<AuditLog> {
  private readonly discordGuildApi: IDiscordGuildApi;

  constructor(discordApiFactory: DiscordApiFactory) {
    super(dataSource.getRepository(AuditLog));
    this.discordGuildApi = discordApiFactory.guildApi();
  }

  async logRoleAdd(sourceUser: SourceUser, targetUserId: string, roleId: string) {
    await this.create({
      action: Action.USER_ROLE_ADD,
      ...(await this.gatherUserInfo(sourceUser, targetUserId)),
      roleId
    });
  }

  async logRoleRemove(sourceUser: SourceUser, targetUserId: string, roleId: string) {
    await this.create({
      action: Action.USER_ROLE_REMOVE,
      ...(await this.gatherUserInfo(sourceUser, targetUserId)),
      roleId
    });
  }

  async logUserKick(sourceUser: SourceUser, targetUserId: string) {
    await this.create({
      action: Action.USER_KICK,
      ...(await this.gatherUserInfo(sourceUser, targetUserId))
    });
  }

  async logUserNickchange(sourceUser: SourceUser, targetUserId: string, nick: string) {
    await this.create({
      action: Action.USER_NICK_CHANGE,
      ...(await this.gatherUserInfo(sourceUser, targetUserId)),
      nick
    });
  }

  async logUserAssociate(sourceUser: SourceUser, targetUserId: string, gw2AccountName: string) {
    await this.create({
      action: Action.USER_ASSOCIATE,
      ...(await this.gatherUserInfo(sourceUser, targetUserId)),
      gw2AccountName
    });
  }

  async logRemoveAssociation(sourceUser: SourceUser, targetUserId: string, gw2AccountName: string) {
    await this.create({
      action: Action.USER_REMOVE_ASSOCIATION,
      gw2AccountName,
      ...(await this.gatherUserInfo(sourceUser, targetUserId))
    });
  }

  async logAddWarning(sourceUser: SourceUser, targetUserId: string, warningId: number) {
    await this.create({
      action: Action.WARNING_ADD,
      ...(await this.gatherUserInfo(sourceUser, targetUserId)),
      warningId
    });
  }

  async logRemoveWarning(sourceUser: SourceUser, targetUserId: string, warningId: number) {
    await this.create({
      action: Action.WARNING_REMOVE,
      ...(await this.gatherUserInfo(sourceUser, targetUserId)),
      warningId
    });
  }

  async logUpdateWarning(sourceUser: SourceUser, targetUserId: string, warningId: number) {
    await this.create({
      action: Action.WARNING_UPDATE,
      ...(await this.gatherUserInfo(sourceUser, targetUserId)),
      warningId
    });
  }

  async logEventCreate(sourceUser: SourceUser, eventId: number) {
    await this.create({
      action: Action.EVENT_ADD,
      ...(await this.gatherUserInfo(sourceUser)),
      eventId
    });
  }

  async logEventUpdate(sourceUser: SourceUser, eventId: number) {
    await this.create({
      action: Action.EVENT_UPDATE,
      ...(await this.gatherUserInfo(sourceUser)),
      eventId
    });
  }

  async logEventRemove(sourceUser: SourceUser, eventId: number) {
    await this.create({
      action: Action.EVENT_REMOVE,
      ...(await this.gatherUserInfo(sourceUser)),
      eventId
    });
  }

  async logEventPost(sourceUser: SourceUser) {
    await this.create({
      action: Action.EVENT_POST,
      ...(await this.gatherUserInfo(sourceUser))
    });
  }

  async logRecruitmentUpdate(sourceUser: SourceUser) {
    await this.create({
      action: Action.RECRUITMENTPOST_UPDATE,
      ...(await this.gatherUserInfo(sourceUser))
    });
  }

  private async gatherUserInfo(sourceUser: SourceUser, targetId?: string) {
    const targetUser = targetId ? await this.getMemberById(targetId) : undefined;

    return {
      sourceUserId: sourceUser.id,
      sourceUsername: sourceUser.username,
      targetUserId: targetId,
      targetUsername:
        targetUser?.nick ?? targetUser?.user?.username ?? targetUser?.user?.global_name
    };
  }

  private async getMemberById(id: string): Promise<DiscordMember | undefined> {
    const key = `user_${id}`;
    const cachedUser = cache.get(key);

    if (cachedUser) return cachedUser;

    try {
      const user = await this.discordGuildApi.getMemberById(id);

      cache.put(key, user, 10000);

      return user;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }
}
