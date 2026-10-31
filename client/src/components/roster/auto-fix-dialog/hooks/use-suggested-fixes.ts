import { useMemo } from 'react';
import type { DiscordRole } from 'server';
import type MemberRecord from '../../../../lib/interfaces/member-record';
import type { SuggestedFixGroups } from '../types';

const useSuggestedFixes = (records: MemberRecord[], roles: DiscordRole[]): SuggestedFixGroups => {
  return useMemo(() => {
    const groups: SuggestedFixGroups = {
      roles: [],
      duplicates: [],
      kicks: [],
      manual: [],
      all: []
    };

    records.forEach(member => {
      if (member.issues.unmatchingRoles && member.discordId && member.rank) {
        const role = roles.find(
          candidate => candidate.name.toLowerCase() === member.rank?.toLowerCase()
        );
        if (role)
          groups.roles.push({ key: `role:${member.discordId}`, kind: 'role', member, role });
      }

      if (
        member.issues.duplicateMatch &&
        member.memberId &&
        member.matchingDiscordMembers &&
        member.matchingDiscordMembers.length > 1
      ) {
        groups.duplicates.push({
          key: `associate:${member.memberId}`,
          kind: 'associate',
          member,
          options: member.matchingDiscordMembers.map(candidate => ({
            value: candidate.id,
            label: candidate.name,
            avatar: candidate.avatar,
            roles: candidate.roles,
            joined: candidate.joined
          }))
        });
      }

      if (member.issues.missingGW2 && member.discordId) {
        groups.kicks.push({ key: `kick:${member.discordId}`, kind: 'kick', member });
      }

      if (member.issues.missingDiscord && member.memberId) {
        groups.manual.push({
          key: `manual-gw2-kick:${member.memberId}`,
          kind: 'manual',
          member,
          action: 'Kick from GW2',
          reason: 'No matching Discord member was found.'
        });
      }
    });

    groups.all = [...groups.roles, ...groups.duplicates, ...groups.kicks, ...groups.manual];
    return groups;
  }, [records, roles]);
};

export default useSuggestedFixes;
