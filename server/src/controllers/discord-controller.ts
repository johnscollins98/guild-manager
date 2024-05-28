import {
  Authorized,
  BadRequestError,
  Body,
  Delete,
  Get,
  Header,
  JsonController,
  NotFoundError,
  OnUndefined,
  Param,
  Post,
  Put
} from 'routing-controllers';
import { Service } from 'typedi';
import { config } from '../config';
import {
  DiscordLog,
  DiscordMember,
  DiscordMemberDTO,
  DiscordMemberUpdate,
  DiscordMessagePost,
  DiscordRole,
  EventSettingsUpsertDTO,
  MemberLeftDTO,
  daysOfWeek
} from '../dtos';
import { DiscordApiFactory } from '../services/discord/api-factory';
import { IDiscordChannelApi } from '../services/discord/channel-api';
import { EventEmbedCreator } from '../services/discord/event-embed-creator';
import { IDiscordGuildApi } from '../services/discord/guild-api';
import { DiscordMemberFormatter } from '../services/discord/member-formatter';
import { EventPostSettingsRepository } from '../services/repositories/event-post-settings-repository';
import { EventRepository } from '../services/repositories/event-repository';
import { MemberLeftRepository } from '../services/repositories/member-left-repository';
import { IDiscordController } from './interfaces/discord-interface';

@Service()
@Authorized()
@JsonController('/api/discord')
export class DiscordController implements IDiscordController {
  private readonly discordGuildApi: IDiscordGuildApi;
  private readonly discordChannelApi: IDiscordChannelApi;
  constructor(
    discordApiFactory: DiscordApiFactory,
    private readonly discordMemberFormatter: DiscordMemberFormatter,
    private readonly discordEventEmbedCreator: EventEmbedCreator,
    private readonly eventRepository: EventRepository,
    private readonly eventSettingsRepository: EventPostSettingsRepository,
    private readonly memberLeftRepository: MemberLeftRepository
  ) {
    this.discordChannelApi = discordApiFactory.channelApi();
    this.discordGuildApi = discordApiFactory.guildApi();
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
  async getLogs(): Promise<DiscordLog> {
    return await this.discordGuildApi.getLogs();
  }

  @Get('/leavers')
  async getLeavers(): Promise<MemberLeftDTO[]> {
    return await this.memberLeftRepository.getAll();
  }

  @OnUndefined(204)
  @Put('/members/:memberId/roles/:roleId')
  async addRoleToMember(
    @Param('memberId') memberId: string,
    @Param('roleId') roleId: string
  ): Promise<void> {
    await this.discordGuildApi.addRoleToMember(memberId, roleId);
  }

  @OnUndefined(204)
  @Delete('/members/:memberId/roles/:roleId')
  async removeRoleFromMember(
    @Param('memberId') memberId: string,
    @Param('roleId') roleId: string
  ): Promise<void> {
    await this.discordGuildApi.removeRoleFromMember(memberId, roleId);
  }

  @OnUndefined(204)
  @Put('/members/:memberId')
  async updateMember(
    @Param('memberId') memberId: string,
    @Body() updates: DiscordMemberUpdate
  ): Promise<void> {
    await this.discordGuildApi.updateMember(memberId, updates);
  }

  @OnUndefined(204)
  @Delete('/members/:memberId')
  async deleteMember(@Param('memberId') memberId: string): Promise<undefined> {
    await this.discordGuildApi.kickMember(memberId);
  }

  @OnUndefined(200)
  @Post('/members/:memberId/messages')
  async sendMessageToMember(
    @Param('memberId') memberId: string,
    @Body() messageData: DiscordMessagePost
  ): Promise<void> {
    const dmChannelId = await this.discordChannelApi.createDirectMessageChannel(memberId);
    await this.discordChannelApi.sendMessage(dmChannelId, messageData);
  }

  @OnUndefined(200)
  @Post('/eventUpdate')
  async postEventUpdates(@Body() settings: EventSettingsUpsertDTO): Promise<void> {
    await this.eventSettingsRepository.updateByGuildId(config.discordGuildId, {
      channelId: settings.channelId,
      editMessages: settings.editMessages,
      ...settings.existingMessageIds
    });
    if (!(await this.discordChannelApi.getChannel(settings.channelId))) {
      throw new NotFoundError('Channel not found');
    }

    if (settings.editMessages) {
      if (!settings.existingMessageIds) throw new BadRequestError('Missing "existingMessageIds"');

      const channelMessages = await this.discordChannelApi.getChannelMessages(settings.channelId);
      const values: string[] = Object.values(settings.existingMessageIds);
      for (const id of values) {
        if (!channelMessages.find(m => m.id === id))
          throw new BadRequestError('Invalid Message IDs');
      }
    }

    for (const day of daysOfWeek) {
      const events = await this.eventRepository.getEventsOnADay(day, { ignore: false });

      const parseTime = (str: string) => {
        return Date.parse(`1970/01/01 ${str}`);
      };

      const sorted = events.sort((a, b) => {
        const aTime = parseTime(a.startTime);
        const bTime = parseTime(b.startTime);

        return aTime - bTime;
      });

      const embed = this.discordEventEmbedCreator.createEmbed(day, sorted);
      if (settings.editMessages && settings.existingMessageIds) {
        const messageId = settings.existingMessageIds[day];
        if (!messageId) throw 'Invalid Message IDs';

        await this.discordChannelApi.editEmbed(settings.channelId, messageId, embed);
      } else {
        await this.discordChannelApi.addEmbed(settings.channelId, embed);
      }

      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
