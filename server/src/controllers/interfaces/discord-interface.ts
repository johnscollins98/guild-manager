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

export interface IDiscordController {
  getRoles(): Promise<DiscordRole[]>;
  getMembers(): Promise<DiscordMemberDTO[]>;
  getLogs(): Promise<DiscordLog>;
  getLeavers(): Promise<MemberLeftDTO[]>;
  getBotRoles(): Promise<DiscordRole[]>;
  getBot(): Promise<DiscordUser>;
  getChannels(): Promise<DiscordChannel[]>;
  getMessages(channelId: string): Promise<DiscordMessage[]>;
  addRoleToMember(memberId: string, roleId: string): Promise<void>;
  removeRoleFromMember(memberId: string, roleId: string): Promise<void>;
  updateMember(memberId: string, updates: DiscordMemberUpdate): Promise<void>;
  deleteMember(memberId: string): Promise<void>;
  sendMessageToMember(memberId: string, messageData: DiscordMessagePost): Promise<void>;
  postEventUpdates(settings: EventSettingsUpsertDTO): Promise<void>;
}
