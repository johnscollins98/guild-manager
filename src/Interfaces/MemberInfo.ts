import Warning from './Warning';

export default interface MemberInfo {
  eventsAttended: number;
  memberId: string;
  warnings: [Warning];
  _v: number;
  _id: string;
}
