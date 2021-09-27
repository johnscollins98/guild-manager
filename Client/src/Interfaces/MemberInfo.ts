import Warning from './Warning';

export default interface MemberInfo {
  memberId: string;
  warnings: Warning[];
  _v: number;
  _id: string;
}

export interface MemberInfoPost {
  memberId: string;
  warnings: Warning[];
}
