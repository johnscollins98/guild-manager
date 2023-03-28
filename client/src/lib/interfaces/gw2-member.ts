import Warning from './warning';

export default interface GW2Member {
  name: string;
  rank: string;
  joined: string;
  warnings: Warning[]; // TODO: should be moved out
}
