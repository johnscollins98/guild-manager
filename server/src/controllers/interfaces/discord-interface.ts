import {
  DiscordLog,
  DiscordMemberDTO,
  DiscordMemberUpdate,
  DiscordMessagePost,
  DiscordRole,
  EventSettingsUpsertDTO,
  MemberLeftDTO
} from '../../dtos';

export interface IDiscordController {
  getRoles(): Promise<DiscordRole[]>;
  getMembers(): Promise<DiscordMemberDTO[]>;
  getLogs(): Promise<DiscordLog>;
  getLeavers(): Promise<MemberLeftDTO[]>;
  getBotRoles(): Promise<DiscordRole[]>;
  addRoleToMember(memberId: string, roleId: string): Promise<void>;
  removeRoleFromMember(memberId: string, roleId: string): Promise<void>;
  updateMember(memberId: string, updates: DiscordMemberUpdate): Promise<void>;
  deleteMember(memberId: string): Promise<void>;
  sendMessageToMember(memberId: string, messageData: DiscordMessagePost): Promise<void>;
  postEventUpdates(settings: EventSettingsUpsertDTO): Promise<void>;
}
