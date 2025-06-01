import { useSuspenseQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { authQuery } from '../../lib/apis/auth-api';
import { discordBotRolesQuery, discordRolesQuery } from '../../lib/apis/discord-api';
import type MemberRecord from '../../lib/interfaces/member-record';

export const useIsHigherRole = (member: MemberRecord) => {
  const [authInfo, botRoles, discordRoles] = useSuspenseQueries({
    queries: [authQuery, discordBotRolesQuery, discordRolesQuery]
  });

  const userRoles = useMemo(() => {
    return authInfo.data.roles.map(id => discordRoles.data.find(r => r.id === id)).filter(r => !!r);
  }, [authInfo.data.roles, discordRoles]);

  const memberIsHigherRole = useMemo(
    () =>
      member.roles.some(
        r =>
          userRoles.every(ur => r.position >= ur.position) ||
          botRoles.data.every(br => r.position >= br.position)
      ),
    [member.roles, userRoles, botRoles]
  );

  return memberIsHigherRole;
};
