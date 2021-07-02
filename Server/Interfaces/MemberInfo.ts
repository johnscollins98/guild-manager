import Warning from './Warning';

export default interface MemberInfo {
  save(): Promise<MemberInfo>;

  memberId: string;
  eventsAttended: number;
  warnings: Warning[];
}
