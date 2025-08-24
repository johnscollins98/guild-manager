import { useSuspenseQueries } from '@tanstack/react-query';
import { type AuditLogEntry } from 'server';
import { getMemberOrUserQuery, useDiscordRoles } from '../../lib/apis/discord-api';
import { getUserName } from '../../lib/utils/helpers';

export const useMemberNames = (data: AuditLogEntry) => {
  const [sourceUser, targetUser] = useSuspenseQueries({
    queries: [getMemberOrUserQuery(data.sourceUserId), getMemberOrUserQuery(data.targetUserId)]
  });

  const sourceName = getUserName(sourceUser.data);
  const targetName = getUserName(targetUser.data);

  return { sourceName, targetName, sourceUser: sourceUser.data, targetUser: targetUser.data };
};

export const useRoleById = (roleId?: string) => {
  const roles = useDiscordRoles();

  if (!roleId) return undefined;

  return roles.data.find(r => r.id === roleId);
};
