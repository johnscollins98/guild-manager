/* eslint-disable @typescript-eslint/no-unused-vars */

import { ChannelType } from 'discord.js';
import { Service } from 'typedi';
import {
  DiscordChannel,
  DiscordEmbed,
  DiscordMessage,
  DiscordMessageDetails,
  DiscordMessagePost
} from '../../../dtos';
import { IDiscordChannelApi } from '../channel-api';

@Service()
export class MockDiscordChannelApi implements IDiscordChannelApi {
  editMessage(
    _channelId: string,
    _messageId: string,
    _messageObject: DiscordMessagePost
  ): Promise<boolean> {
    return Promise.resolve(true);
  }

  getChannel(_channelId: string): Promise<DiscordChannel> {
    return Promise.resolve({
      id: '1234',
      name: 'Channel 1',
      type: ChannelType.GuildText,
      position: 1
    });
  }

  createDirectMessageChannel(_userId: string): Promise<string> {
    return Promise.resolve('1234');
  }

  getChannelMessages(_channelId: string): Promise<DiscordMessage[]> {
    return Promise.resolve([
      { id: '1234', author: { id: '1', username: 'test' }, timestamp: new Date().toISOString() }
    ]);
  }

  getChannelMessage(_channelId: string, _messageId: string): Promise<DiscordMessageDetails> {
    return Promise.resolve({
      id: '1234',
      embeds: []
    });
  }

  editEmbed(_channelId: string, _messageId: string, _embed: DiscordEmbed): Promise<boolean> {
    return Promise.resolve(true);
  }

  addEmbed(_channelId: string, _embed: DiscordEmbed): Promise<boolean> {
    return Promise.resolve(true);
  }

  sendMessage(_channelId: string, _messageObject: DiscordMessagePost): Promise<boolean> {
    return Promise.resolve(true);
  }
}
