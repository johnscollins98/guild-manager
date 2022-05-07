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
import DiscordMember, { DiscordMemberUpdate } from '../models/interfaces/discordmember.interface';
import DiscordRole from '../models/interfaces/discordrole.interface';
import { EventPostSettings } from '../models/eventPostSettings.model';
import { DiscordChannelApi } from '../services/discord/channelapi.discord.service';
import { DiscordGuildApi } from '../services/discord/guildapi.discord.service';
import { DiscordMemberFormatter } from '../services/discord/memberformatter.discord.service';
import { EventEmbedCreator } from '../services/discord/eventembedcreator.discord.service';
import { EventRepository } from '../services/repositories/event.repository';
import { EventPostSettingsRepository } from '../services/repositories/eventpostsettings.repository';

@Service()
@Authorized()
@JsonController('/api/discord')
export class DiscordController {
  constructor(
    private readonly discordGuildApi: DiscordGuildApi,
    private readonly discordChannelApi: DiscordChannelApi,
    private readonly discordMemberFormatter: DiscordMemberFormatter,
    private readonly discordEventEmbedCreator: EventEmbedCreator,
    private readonly eventRepository: EventRepository,
    private readonly eventSettingsRepository: EventPostSettingsRepository
  ) {}

  @Get('/roles')
  async getRoles() {
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
  async getMembers() {
    const results: [DiscordMember[], DiscordRole[]] = await Promise.all([
      this.discordGuildApi.getMembers(),
      this.discordGuildApi.getRoles()
    ]);
    return await this.discordMemberFormatter.formatMembers(...results);
  }

  @Get('/log')
  async getLogs() {
    return await this.discordGuildApi.getLogs();
  }

  @OnUndefined(204)
  @Put('/members/:memberId/roles/:roleId')
  async addRoleToMember(@Param('memberId') memberId: string, @Param('roleId') roleId: string) {
    await this.discordGuildApi.addRoleToMember(memberId, roleId);
  }

  @OnUndefined(204)
  @Delete('/members/:memberId/roles/:roleId')
  async removeRoleFromMember(@Param('memberId') memberId: string, @Param('roleId') roleId: string) {
    await this.discordGuildApi.removeRoleFromMember(memberId, roleId);
  }

  @OnUndefined(204)
  @Put('/members/:memberId')
  async updateMember(@Param('memberId') memberId: string, @Body() updates: DiscordMemberUpdate) {
    return await this.discordGuildApi.updateMember(memberId, updates);
  }

  @OnUndefined(204)
  @Delete('/members/:memberId')
  async deleteMember(@Param('memberId') memberId: string) {
    // send re-invite message
    const dmChannelId = await this.discordChannelApi.createDirectMessageChannel(memberId);
    await this.discordChannelApi.sendMessage(dmChannelId, {
      content: `You have been kicked from Sunspear Order. You are welcome to re-join using this link: ${config.discordInviteLink}`
    });

    // kick member
    await this.discordGuildApi.kickMember(memberId);
  }

  @OnUndefined(200)
  @Post('/eventUpdate')
  async postEventUpdates(@Body() settings: EventPostSettings) {
    await this.eventSettingsRepository.updateByGuildId(config.discordGuildId, settings);
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

    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];

    for (const day of daysOfWeek) {
      const events = await this.eventRepository.getEventsOnADay(day);

      const parseTime = (str: string) => {
        return Date.parse(`1970/01/01 ${str}`);
      };

      const sorted = events.sort((a, b) => {
        const aTime = parseTime(a.startTime);
        const bTime = parseTime(b.startTime);

        return aTime - bTime;
      });

      const embed = this.discordEventEmbedCreator.createEmbed(day, sorted);
      if (settings.editMessages) {
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
