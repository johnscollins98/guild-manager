import { FormattedLogEntry, GW2Member, GW2Rank } from '../../dtos';

export interface IGW2Controller {
  getLog(): Promise<FormattedLogEntry[]>;
  getMembers(): Promise<GW2Member[]>;
  getRanks(): Promise<GW2Rank[]>;
}
