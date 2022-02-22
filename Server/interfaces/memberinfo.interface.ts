import Warning from './warning.interface';

export default interface MemberInfo {
  memberId: string;
  warnings: Warning[];
}
