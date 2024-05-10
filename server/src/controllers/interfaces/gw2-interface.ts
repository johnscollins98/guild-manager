import { GW2LogEntryDTO, GW2Member, GW2Rank } from '../../dtos';

export interface IGW2Controller {
  getLog(): Promise<GW2LogEntryDTO[]>;
  getMembers(): Promise<GW2Member[]>;
  getRanks(): Promise<GW2Rank[]>;
}
