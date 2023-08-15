import { Service } from 'typedi';
import GW2LogEntry from '../../../models/interfaces/gw2-log-entry';
import GW2Member from '../../../models/interfaces/gw2-member';
import GW2Rank from '../../../models/interfaces/gw2-rank';
import { IGW2GuildApi } from '../guild-api';

const members: GW2Member[] = [
  { joined: '2020-10-10T10:10:10Z', name: '1', rank: '1' },
  { joined: '2020-10-10T10:10:10Z', name: '3', rank: '1' }
];

const log: GW2LogEntry[] = [];

const ranks: GW2Rank[] = [{ id: '1', order: 1, permissions: ['1'], icon: '' }];

@Service()
export class MockGW2GuildApi implements IGW2GuildApi {
  getMembers(): Promise<GW2Member[]> {
    return Promise.resolve(members);
  }

  getLog(): Promise<GW2LogEntry[]> {
    return Promise.resolve(log);
  }

  getRanks(): Promise<GW2Rank[]> {
    return Promise.resolve(ranks);
  }
}
