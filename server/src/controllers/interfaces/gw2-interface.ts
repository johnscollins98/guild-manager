import { FormattedLogEntry, GW2Member, GW2Rank } from '../../models';

export interface IGW2Controller {
  getLog(): Promise<FormattedLogEntry[]>;
  getMembers(): Promise<GW2Member[]>;
  getRanks(): Promise<GW2Rank[]>;
}
