import type { DiscordRole } from 'server';
import type MemberRecord from '../../../lib/interfaces/member-record';

export type SuggestedFix =
  | { key: string; kind: 'role'; member: MemberRecord; role: DiscordRole }
  | { key: string; kind: 'kick'; member: MemberRecord }
  | { key: string; kind: 'manual'; member: MemberRecord; action: string; reason: string }
  | {
      key: string;
      kind: 'associate';
      member: MemberRecord;
      options: {
        value: string;
        label: string;
        avatar?: string;
        roles?: DiscordRole[];
        joined?: string;
      }[];
    };

export interface SuggestedFixGroups {
  roles: Extract<SuggestedFix, { kind: 'role' }>[];
  duplicates: Extract<SuggestedFix, { kind: 'associate' }>[];
  kicks: Extract<SuggestedFix, { kind: 'kick' }>[];
  manual: Extract<SuggestedFix, { kind: 'manual' }>[];
  all: SuggestedFix[];
}
