import Assignment from '@mui/icons-material/Assignment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import List from '@mui/icons-material/List';
import Person from '@mui/icons-material/Person';
import { IconButton, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { type AuthInfo, type WarningDTO, type WarningType, WarningTypeLabels } from 'server';
import { useDeleteWarningMutation, useUpdateWarningMutation } from '../../../lib/apis/warnings-api';
import { useConfirm } from '../../common/confirm-dialog';
import WarningForm from './warning-form';

export interface WarningEntryProps {
  warning: WarningDTO;
  authData: AuthInfo;
  getNameForDiscordId: (id: string) => string;
}

export const WarningEntry = ({ warning, getNameForDiscordId, authData }: WarningEntryProps) => {
  const confirm = useConfirm();

  const deleteWarningMutation = useDeleteWarningMutation();
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
      await deleteWarningMutation.mutateAsync(warning.id);
    }
  }, [warning, deleteWarningMutation, confirm]);

  return (
    <>
      <div className="log-entry-card">
        <div className="top-row">
          <div className="data">
            <span className="date field">
              <CalendarToday className="icon" color="secondary" />
              <Typography>{new Date(warning.timestamp).toDateString()}</Typography>
            </span>
            <span className="given-by field">
              <Person className="icon" color="secondary" />
              <Typography>{getNameForDiscordId(warning.givenBy)}</Typography>
            </span>
            <span className="field">
              <List className="icon" color="secondary" />
              <Typography>{WarningTypeLabels[warning.type]}</Typography>
            </span>
            <span className="reason field">
              <Assignment className="icon" color="secondary" />
              <Typography>{warning.reason}</Typography>
            </span>
          </div>
          {authData.permissions.WARNINGS && (
            <div className="actions">
              <IconButton onClick={() => setShowUpdate(true)} disabled={isPending}>
                <Edit color="primary" />
              </IconButton>
              <IconButton onClick={() => handleDeleteWarning()}>
                <Close color="error" />
              </IconButton>
            </div>
          )}
        </div>
        {warning.lastUpdatedBy && (
          <div>
            <Typography variant="caption">
              Updated by <i>{getNameForDiscordId(warning.lastUpdatedBy)}</i> on{' '}
              <i>{new Date(warning.lastUpdatedTimestamp).toDateString()}</i>
            </Typography>
          </div>
        )}
      </div>
      <WarningForm
        isOpen={showUpdate}
        onClose={() => setShowUpdate(false)}
        onSubmit={handleUpdateWarning}
        initialData={showUpdate ? warning : undefined}
      />
    </>
  );
};
