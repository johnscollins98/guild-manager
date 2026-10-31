import { useSuspenseQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { DiscordRole } from 'server';
import { authQuery } from '../../lib/apis/auth-api';
import { discordBotRolesQuery, discordRolesQuery } from '../../lib/apis/discord-api';
import type MemberRecord from '../../lib/interfaces/member-record';

export const useHigherRoleMemberIds = (members: MemberRecord[]) => {
  const [authInfo, botRoles, discordRoles] = useSuspenseQueries({
    queries: [authQuery, discordBotRolesQuery, discordRolesQuery]
  });

  const userRoles = useMemo(() => {
    return authInfo.data.roles.map(id => discordRoles.data.find(r => r.id === id)).filter(r => !!r);
  }, [authInfo.data.roles, discordRoles]);

  return useMemo(
    () =>
      new Set(
        members
          .filter(member =>
            member.roles.some(
              role =>
                userRoles.every(userRole => role.position >= userRole.position) ||
                botRoles.data.every(botRole => role.position >= botRole.position)
            )
          )
          .map(member => member.discordId)
          .filter((id): id is string => Boolean(id))
      ),
    [members, userRoles, botRoles]
  );
};

export const useUnmanageableRoleIds = (roles: DiscordRole[]) => {
  const [botRoles] = useSuspenseQueries({ queries: [discordBotRolesQuery] });

  return useMemo(
    () =>
      new Set(
        roles
          .filter(role => botRoles.data.every(botRole => role.position >= botRole.position))
          .map(role => role.id)
      ),
    [roles, botRoles]
  );
};

export const useIsHigherRole = (member: MemberRecord) =>
  useHigherRoleMemberIds([member]).has(member.discordId ?? '');
