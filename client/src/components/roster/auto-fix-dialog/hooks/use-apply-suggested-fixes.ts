import { useState } from 'react';
import { useToast } from '../../../common/toast/toast-context';
import {
  useAddDiscordRole,
  useKickDiscordMembers,
  useRemoveDiscordRole
} from '../../../../lib/apis/discord-api';
import { useAssociateToDiscordAccountMutation } from '../../../../lib/apis/gw2-api';
import type { SuggestedFix } from '../types';

interface Options {
  fixes: SuggestedFix[];
  associationTargets: Record<string, string>;
  reinviteByKick: Record<string, boolean>;
  reason: string;
  onComplete: () => void;
}

const useApplySuggestedFixes = ({
  fixes,
  associationTargets,
  reinviteByKick,
  reason,
  onComplete
}: Options) => {
  const openToast = useToast();
  const addRole = useAddDiscordRole();
  const removeRole = useRemoveDiscordRole();
  const kick = useKickDiscordMembers();
  const associate = useAssociateToDiscordAccountMutation();
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);

  const busy = working || addRole.isPending || removeRole.isPending || kick.isPending || associate.isPending;

  const applyFixes = async () => {
    setWorking(true);
    setProgress(0);
    let failures = 0;

    for (const [index, fix] of fixes.entries()) {
      const name = fix.member.nickname || fix.member.discordName || fix.member.accountName;

      try {
        if (fix.kind === 'role' && fix.member.discordId) {
          const currentRoleIds = fix.member.roles.map(role => role.id);
          for (const role of fix.member.roles) {
            if (role.name.toLowerCase() !== fix.role.name.toLowerCase()) {
              await removeRole.mutateAsync({ memberId: fix.member.discordId, role });
            }
          }
          if (!currentRoleIds.includes(fix.role.id)) {
            await addRole.mutateAsync({ memberId: fix.member.discordId, role: fix.role });
          }
          openToast(`Updated ${name}'s role to ${fix.role.name}.`, 'success');
        } else if (fix.kind === 'kick' && fix.member.discordId) {
          await kick.mutateAsync({
            memberIds: [fix.member.discordId],
            reinvite: !!reinviteByKick[fix.key],
            reason: reason.trim() || undefined
          });
          openToast(`Kicked ${name}.`, 'success');
        } else if (fix.kind === 'associate') {
          const discordAccountId = associationTargets[fix.key];
          if (!fix.member.memberId || !discordAccountId) {
            throw new Error('Missing association target');
          }
          await associate.mutateAsync({
            gw2AccountName: fix.member.memberId,
            discordAccountId
          });
          openToast(`Associated ${fix.member.memberId} to a Discord account.`, 'success');
        }
      } catch {
        failures += 1;
        openToast(`Could not apply suggested fix for ${name}.`, 'error');
      }

      setProgress(index + 1);
    }

    setWorking(false);
    if (failures === 0) {
      openToast(`Finished applying ${fixes.length} suggested fix${fixes.length === 1 ? '' : 'es'}.`, 'success');
      onComplete();
    } else {
      openToast(`Finished with ${failures} failed fix${failures === 1 ? '' : 'es'}.`, 'warning');
    }
  };

  return { applyFixes, busy, progress };
};

export default useApplySuggestedFixes;
