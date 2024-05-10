export interface MemberLeftDTO {
  id: number;
  username: string;
  nickname?: string;
  displayName: string;
  userDisplayName: string;
  globalName?: string;
  time: Date;
}
