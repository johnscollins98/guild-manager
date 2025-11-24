import { DiscordAPIError, User } from 'discord.js';
import {
  Authorized,
  BadRequestError,
  Body,
  CurrentUser,
  Delete,
  ForbiddenError,
  Get,
  Header,
  InternalServerError,
  JsonController,
  NotFoundError,
  OnUndefined,
  Param,
  Post,
  Put,
  QueryParam
} from 'routing-controllers';
import { Service } from 'typedi';
import { config } from '../config';
import {
  DiscordChannel,
  DiscordLog,
  DiscordMember,
  DiscordMemberDTO,
  DiscordMemberUpdate,
  DiscordMessagePost,
  DiscordRole,
  DiscordUser,
  EventSettingsUpsertDTO,
  MemberLeftDTO
} from '../dtos';
import { DiscordApiFactory } from '../services/discord/api-factory';
import { IDiscordChannelApi } from '../services/discord/channel-api';
import { EventEmbedCreator } from '../services/discord/event-embed-creator';
import { IDiscordGuildApi } from '../services/discord/guild-api';
import { DiscordMemberFormatter } from '../services/discord/member-formatter';
import { IDiscordUserApi } from '../services/discord/user-api';
import { AuditLogRepository } from '../services/repositories/audit-log-repository';
import { EventPostSettingsRepository } from '../services/repositories/event-post-settings-repository';
import { MemberLeftRepository } from '../services/repositories/member-left-repository';
import { IDiscordController } from './interfaces/discord-interface';

@Service()
@Authorized()
@JsonController('/api/discord')
export class DiscordController implements IDiscordController {
  private readonly discordGuildApi: IDiscordGuildApi;
  private readonly discordChannelApi: IDiscordChannelApi;
  private readonly discordUserApi: IDiscordUserApi;
  constructor(
    discordApiFactory: DiscordApiFactory,
    private readonly discordMemberFormatter: DiscordMemberFormatter,
    private readonly discordEventEmbedCreator: EventEmbedCreator,
    private readonly eventSettingsRepository: EventPostSettingsRepository,
    private readonly memberLeftRepository: MemberLeftRepository,
    private readonly auditLogRepo: AuditLogRepository
  ) {
    this.discordChannelApi = discordApiFactory.channelApi();
    this.discordGuildApi = discordApiFactory.guildApi();
    this.discordUserApi = discordApiFactory.userApi();
  }

  @Get('/roles')
  async getRoles(): Promise<DiscordRole[]> {
    const results: [DiscordRole[], string[]] = await Promise.all([
      await this.discordGuildApi.getRoles(),
      await this.discordMemberFormatter.getValidRoles()
    ]);
    const [discordRoles, validRoleIds] = results;
    return this.discordMemberFormatter.getRoleInfo(
      discordRoles,
      discordRoles.sort((a, b) => b.position - a.position).map(r => r.id),
      validRoleIds
    );
  }

  @Get('/members')
  @Header('Cache-control', `public, max-age=0`)
  async getMembers(): Promise<DiscordMemberDTO[]> {
    const results: [DiscordMember[], DiscordRole[]] = await Promise.all([
      this.discordGuildApi.getMembers(),
      this.discordGuildApi.getRoles()
    ]);
    return await this.discordMemberFormatter.formatMembers(...results);
  }

  @Get('/log')
  async getLogs(@QueryParam('before') before?: string): Promise<DiscordLog> {
    return await this.discordGuildApi.getLogs(100, before);
  }

  @Get('/leavers')
  async getLeavers(): Promise<MemberLeftDTO[]> {
    return await this.memberLeftRepository.getAll();
  }

  @Get('/bot-roles')
  async getBotRoles(): Promise<DiscordRole[]> {
    const user = await this.discordUserApi.getCurrentUser();
    const id = user.id;

    const [roles, member] = await Promise.all([
      this.discordGuildApi.getRoles(),
      this.discordGuildApi.getMemberById(id)
    ]);

    return this.discordMemberFormatter.getRoleInfo(
      roles,
      member?.roles ?? [],
      roles.map(r => r.name)
    );
  }

  @Get('/bot')
  async getBot(): Promise<DiscordUser> {
    return await this.discordUserApi.getCurrentUser();
  }

  @Get('/user/:userId')
  async getUserById(@Param('userId') userId: string) {
    return await this.discordUserApi.getUserById(userId);
  }

  @Get('/channels')
  async getChannels(): Promise<DiscordChannel[]> {
    return await this.discordGuildApi.getChannels();
  }

  @Get('/channels/:channelId/messages')
  async getMessages(@Param('channelId') channelId: string) {
    return await this.discordChannelApi.getChannelMessages(channelId);
  }

  @OnUndefined(204)
  @Authorized('MEMBERS')
  @Put('/members/:memberId/roles/:roleId')
  async addRoleToMember(
    @Param('memberId') memberId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: Express.User
  ): Promise<void> {
    await this.auditLogRepo.logRoleAdd(user, memberId, roleId);
    await this.discordGuildApi.addRoleToMember(memberId, roleId);
  }

  @OnUndefined(204)
  @Authorized('MEMBERS')
  @Delete('/members/:memberId/roles/:roleId')
  async removeRoleFromMember(
    @Param('memberId') memberId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: Express.User
  ): Promise<void> {
    await this.auditLogRepo.logRoleRemove(user, memberId, roleId);
    await this.discordGuildApi.removeRoleFromMember(memberId, roleId);
  }

  @OnUndefined(204)
  @Authorized('MEMBERS')
  @Put('/members/:memberId')
  async updateMember(
    @Param('memberId') memberId: string,
    @Body() updates: DiscordMemberUpdate,
    @CurrentUser() user: Express.User
  ): Promise<void> {
    await this.auditLogRepo.logUserNickchange(user, memberId, updates.nick ?? '');
    await this.discordGuildApi.updateMember(memberId, updates);
  }

  @OnUndefined(204)
  @Authorized('MEMBERS')
  @Delete('/members/:memberId')
  async deleteMember(
    @Param('memberId') memberId: string,
    @CurrentUser() user: Express.User
  ): Promise<undefined> {
    await this.auditLogRepo.logUserKick(user, memberId);
    await this.discordGuildApi.kickMember(memberId);
  }

  @OnUndefined(200)
  @Authorized('MEMBERS')
  @Post('/members/:memberId/messages')
  async sendMessageToMember(
    @Param('memberId') memberId: string,
    @Body() messageData: DiscordMessagePost
  ): Promise<void> {
    try {
      const dmChannelId = await this.discordChannelApi.createDirectMessageChannel(memberId);
      await this.discordChannelApi.sendMessage(dmChannelId, messageData);
    } catch (err) {
      if (err instanceof DiscordAPIError && err.status === 403) {
        throw new ForbiddenError(err.message);
      } else {
        throw new InternalServerError('An unknown error occurred.');
      }
    }
  }

  @OnUndefined(200)
  @Authorized('EVENTS')
  @Post('/eventUpdate')
  async postEventUpdates(
    @Body() newSettings?: EventSettingsUpsertDTO,
    @CurrentUser() user?: User
  ): Promise<void> {
    if (newSettings) {
      await this.eventSettingsRepository.updateByGuildId(config.discordGuildId, {
        channelId: newSettings.channelId,
        editMessages: newSettings.editMessages,
        messageId: newSettings.messageId
      });
    }

    const settings = await this.eventSettingsRepository.findOrCreateByGuildId(
      config.discordGuildId
    );

    const channelId = settings.channelId;

    if (!channelId) {
      throw new BadRequestError('No channel id');
    }

    if (!(await this.discordChannelApi.getChannel(channelId))) {
      throw new NotFoundError('Channel not found');
    }

    const channelMessages = await this.discordChannelApi.getChannelMessages(channelId);

    const embeds = await this.discordEventEmbedCreator.createEmbeds();

    if (settings.editMessages) {
      const messageId = settings.messageId;
      if (!messageId) throw 'Invalid Message IDs';

      if (!channelMessages.find(m => m.id === messageId)) {
        throw new BadRequestError('Invalid Message IDs');
      }

      await this.discordChannelApi.editMessage(channelId, messageId, embeds);
    } else {
      await this.discordChannelApi.sendMessage(channelId, embeds);
    }

    if (user) {
      await this.auditLogRepo.logEventPost(user);
    }
  }
}
