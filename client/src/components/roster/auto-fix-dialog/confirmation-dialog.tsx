import { Alert, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { DiscordRole } from 'server';
import { getColorFromRole } from '../../../lib/utils/helpers';
import type { SuggestedFix } from './types';

interface Props {
  open: boolean;
  busy: boolean;
  fixes: SuggestedFix[];
  roles: DiscordRole[];
  associationTargets: Record<string, string>;
  reinviteByKick: Record<string, boolean>;
  reinviteCount: number;
  reason: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog = ({
  open,
  busy,
  fixes,
  roles,
  associationTargets,
  reinviteByKick,
  reinviteCount,
  reason,
  onClose,
  onConfirm
}: Props) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Confirm suggested changes</DialogTitle>
    <DialogContent dividers>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Review the selected actions. Nothing will be changed until you confirm.
      </Typography>
      <List dense>
        {fixes.map((fix, index) => {
          if (fix.kind === 'manual') return null;

          let name = fix.member.nickname || fix.member.discordName || fix.member.accountName;
          let avatar = fix.member.avatar;
          let nameColor = 'text.primary';
          let detail: ReactNode;

          if (fix.kind === 'role') {
            nameColor = getColorFromRole(fix.member.rank, [fix.role]) ?? 'text.primary';
            detail = <>Update Discord role to <Box component="span" sx={{ color: getColorFromRole(fix.role.name, [fix.role]) ?? 'inherit', fontWeight: 600 }}>{fix.role.name}</Box></>;
          } else if (fix.kind === 'kick') {
            nameColor = getColorFromRole(fix.member.roles[0]?.name, fix.member.roles) ?? 'text.primary';
            detail = `Kick from Discord${reinviteByKick[fix.key] ? ' · Send a re-invite' : ''}`;
          } else {
            const selected = fix.options.find(option => option.value === associationTargets[fix.key]);
            if (selected) {
              name = selected.label;
              avatar = selected.avatar;
              nameColor = selected.roles?.[0]
                ? getColorFromRole(selected.roles[0].name, selected.roles) ?? 'text.primary'
                : 'text.primary';
            }
            detail = <>Associate <Box component="span" sx={{ color: getColorFromRole(fix.member.rank, roles) ?? 'text.primary', fontWeight: 600 }}>{fix.member.memberId}</Box> with this Discord account</>;
          }

          return (
            <ListItem key={fix.key} divider={index < fixes.length - 1} sx={{ px: 2, py: 1 }}>
              <Avatar src={avatar} alt="" sx={{ width: 32, height: 32, mr: 1.5 }}>
                {name.slice(0, 1).toUpperCase()}
              </Avatar>
              <Stack spacing={0} sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: nameColor }}>{name}</Typography>
                <Typography variant="caption" color="text.secondary">{detail}</Typography>
              </Stack>
            </ListItem>
          );
        })}
      </List>
      {reinviteCount > 0 && reason.trim() && (
        <Alert severity="info">Re-invite reason: {reason.trim()}</Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={busy}>Cancel</Button>
      <Button variant="contained" onClick={onConfirm} disabled={busy || fixes.length === 0}>
        Confirm and apply
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
