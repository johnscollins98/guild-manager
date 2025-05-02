import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import {
  type AuthInfo,
  type DiscordMemberDTO,
  type WarningDTO,
  type WarningType,
  WarningTypeLabels
} from 'server';
import { useDeleteWarningMutation, useUpdateWarningMutation } from '../../../lib/apis/warnings-api';
import { useConfirm } from '../../common/confirm-dialog';
import WarningFormDialog from './warning-form';

export interface WarningEntryProps {
  warning: WarningDTO;
  authData: AuthInfo;
  getDiscordMemberById: (id?: string) => DiscordMemberDTO | undefined;
}

export const WarningEntry = ({ warning, getDiscordMemberById, authData }: WarningEntryProps) => {
  const confirm = useConfirm();

  const { isPending: isDeletePending, mutateAsync: deleteWarningMutation } =
    useDeleteWarningMutation();
  const { isPending, mutateAsync: updateWarning } = useUpdateWarningMutation();

  const [showUpdate, setShowUpdate] = useState(false);

  const handleUpdateWarning = useCallback(
    async (reason: string, type: WarningType) => {
      await updateWarning({ id: warning.id, givenTo: warning.givenTo, reason, type });
    },
    [updateWarning, warning]
  );

  const handleDeleteWarning = useCallback(async () => {
    const res = await confirm('Are you sure you want to delete this warning?', 'Delete Warning');
    if (res) {
      await deleteWarningMutation(warning.id);
    }
  }, [warning, deleteWarningMutation, confirm]);

  const givenByUser = useMemo(
    () => getDiscordMemberById(warning.givenBy),
    [warning.givenBy, getDiscordMemberById]
  );
  const givenByName = useMemo(() => getNameForDiscordMember(givenByUser), [givenByUser]);
  const updatedByUser = useMemo(
    () => getDiscordMemberById(warning.lastUpdatedBy),
    [warning.lastUpdatedBy, getDiscordMemberById]
  );
  const updatedByName = useMemo(() => getNameForDiscordMember(updatedByUser), [updatedByUser]);

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        gap="8px"
        paddingY="16px"
        sx={t => ({ borderTop: `1px solid ${t.palette.divider}` })}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Box display="flex" gap="8px" alignItems="center">
            <Tooltip title={`Given by ${givenByName}`}>
              <Avatar
                src={givenByUser?.avatar}
                alt={givenByName}
                sx={{ height: '32px', width: '32px' }}
              >
                {givenByName}
              </Avatar>
            </Tooltip>
            <Box display="flex" flexDirection="column">
              <Typography variant="caption">
                {new Date(warning.timestamp).toLocaleDateString(undefined, { dateStyle: 'short' })}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                {WarningTypeLabels[warning.type]}
              </Typography>
            </Box>
          </Box>
          {authData.permissions.WARNINGS && (
            <Box display="flex" gap="2px" alignItems="center">
              <IconButton onClick={() => setShowUpdate(true)} disabled={isPending}>
                <Edit color="primary" />
              </IconButton>
              <IconButton onClick={() => handleDeleteWarning()} disabled={isDeletePending}>
                <Close color="error" />
              </IconButton>
            </Box>
          )}
        </Box>
        <span className="reason field">
          <Typography>{warning.reason}</Typography>
        </span>
        {warning.lastUpdatedBy && (
          <div>
            <Typography variant="caption">
              Updated by <i>{updatedByName}</i> on{' '}
              <i>
                {new Date(warning.lastUpdatedTimestamp).toLocaleDateString(undefined, {
                  dateStyle: 'short'
                })}
              </i>
            </Typography>
          </div>
        )}
      </Box>
      <WarningFormDialog
        isOpen={showUpdate}
        onClose={() => setShowUpdate(false)}
        onSubmit={handleUpdateWarning}
        isPending={isPending}
        initialData={showUpdate ? warning : undefined}
      />
    </>
  );
};

const getNameForDiscordMember = (discordMember?: DiscordMemberDTO) => {
  return discordMember?.nickname ?? discordMember?.name ?? 'Unknown User';
};
