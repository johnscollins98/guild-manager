import Warning from './Warning';

export default interface MemberInfo {
  memberId: string;
  eventsAttended: number;
  warnings: Warning[];
}
