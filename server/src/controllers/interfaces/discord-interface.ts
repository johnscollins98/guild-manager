import {
  DiscordChannel,
  DiscordLog,
  DiscordMemberDTO,
  DiscordMemberUpdate,
  DiscordMessage,
  DiscordMessagePost,
  DiscordRole,
  DiscordUser,
  EventSettingsUpsertDTO,
  MemberLeftDTO
} from '../../dtos';
import { User } from './user';
export interface IDiscordController {
  getRoles(): Promise<DiscordRole[]>;
  getMembers(): Promise<DiscordMemberDTO[]>;
  getLogs(): Promise<DiscordLog>;
  getLeavers(): Promise<MemberLeftDTO[]>;
  getBotRoles(): Promise<DiscordRole[]>;
  getBot(): Promise<DiscordUser>;
  getUserById(userId: string): Promise<DiscordUser | undefined>;
  getChannels(): Promise<DiscordChannel[]>;
  getMessages(channelId: string): Promise<DiscordMessage[]>;
  addRoleToMember(memberId: string, roleId: string, user?: User): Promise<void>;
  removeRoleFromMember(memberId: string, roleId: string, user?: User): Promise<void>;
  updateMember(memberId: string, updates: DiscordMemberUpdate, user?: User): Promise<void>;
  deleteMember(memberId: string, user?: User): Promise<void>;
  sendMessageToMember(memberId: string, messageData: DiscordMessagePost): Promise<void>;
  postEventUpdates(settings?: EventSettingsUpsertDTO, user?: User): Promise<void>;
}
