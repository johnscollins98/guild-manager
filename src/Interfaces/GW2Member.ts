import Warning from './Warning';

export default interface GW2Member {
  name: string;
  rank: string;
  joined: string;
  eventsAttended: number; // TODO: should be moved out
  warnings: Warning[]; // TODO: should be moved out
}
