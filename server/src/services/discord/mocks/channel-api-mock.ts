/* eslint-disable @typescript-eslint/no-unused-vars */

import { Service } from 'typedi';
import {
  DiscordChannel,
  DiscordEmbed,
  DiscordMessage,
  DiscordMessageDetails,
  DiscordMessagePost
} from '../../../models';
import { IDiscordChannelApi } from '../channel-api';

@Service()
export class MockDiscordChannelApi implements IDiscordChannelApi {
  getChannel(_channelId: string): Promise<DiscordChannel> {
    return Promise.resolve({ id: '1234' });
  }

  createDirectMessageChannel(_userId: string): Promise<string> {
    return Promise.resolve('1234');
  }

  getChannelMessages(_channelId: string): Promise<DiscordMessage[]> {
    return Promise.resolve([{ id: '1234' }]);
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
