export interface MemberLeftDTO {
  id: number;
  userId?: string;
  username: string;
  nickname?: string;
  displayName: string;
  userDisplayName: string;
  globalName?: string;
  time: Date;
}
