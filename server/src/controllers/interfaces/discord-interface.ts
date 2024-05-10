import {
  DiscordLog,
  DiscordMemberUpdate,
  DiscordMessagePost,
  DiscordRole,
  EventSettingsUpsertDTO,
  FormattedDiscordMember,
  MemberLeftDTO
} from '../../models';

export interface IDiscordController {
  getRoles(): Promise<DiscordRole[]>;
  getMembers(): Promise<FormattedDiscordMember[]>;
  getLogs(): Promise<DiscordLog>;
  getLeavers(): Promise<MemberLeftDTO[]>;
  addRoleToMember(memberId: string, roleId: string): Promise<void>;
  removeRoleFromMember(memberId: string, roleId: string): Promise<void>;
  updateMember(memberId: string, updates: DiscordMemberUpdate): Promise<void>;
  deleteMember(memberId: string): Promise<void>;
  sendMessageToMember(memberId: string, messageData: DiscordMessagePost): Promise<void>;
  postEventUpdates(settings: EventSettingsUpsertDTO): Promise<void>;
}
