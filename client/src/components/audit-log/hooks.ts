import { type AuditLogEntry } from 'server';
import { useDiscordMembers, useDiscordRoles } from '../../lib/apis/discord-api';

export const useMemberNames = (data: AuditLogEntry) => {
  const discordMembers = useDiscordMembers();

  const sourceUser = discordMembers.data.find(m => m.id === data.sourceUserId);
  const sourceName =
    sourceUser?.nickname ?? sourceUser?.name ?? data.sourceUsername ?? 'Unknown User';

  const targetUser = discordMembers.data.find(m => m.id === data.targetUserId);
  const targetName =
    targetUser?.nickname ?? targetUser?.name ?? data.targetUsername ?? 'Unknown User';

  return { sourceName, targetName, sourceUser, targetUser };
};

export const useRoleById = (roleId?: string) => {
  const roles = useDiscordRoles();

  if (!roleId) return undefined;

  return roles.data.find(r => r.id === roleId);
};
