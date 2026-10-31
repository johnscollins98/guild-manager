import { useCallback, useState } from 'react';
import type MemberRecord from '../../lib/interfaces/member-record';
import AutoFixDialog from './auto-fix-dialog';
import KickModal from './kick-modal';
import RosterControl from './roster-control';

import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { QueryBoundary } from '../common/query-boundary';
import { RosterList } from './member-list';
import { RosterLoader } from './roster-loader';
import { RosterSummary } from './roster-summary';
import { useRoster } from './use-roster';

const Roster = () => {
  const [kickMode, setKickMode] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  const [kickModalShow, setKickModalShow] = useState(false);
  const [autoFixOpen, setAutoFixOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { roster, discordRoles } = useRoster(
    searchParams.get('sortBy') || undefined,
    searchParams.get('sortOrder') === 'ASC',
    undefined,
    searchParams.get('filterBy') || undefined
  );

  const onKick = useCallback((member: MemberRecord) => {
    if (member.discordId) {
      setSelection([member.discordId]);
      setKickModalShow(true);
    }
  }, []);

  return (
    <>
      <RosterControl
        kickMode={kickMode}
        setKickMode={setKickMode}
        selection={selection}
        setSelection={setSelection}
        onKick={() => setKickModalShow(true)}
        onAutoFix={() => setAutoFixOpen(open => !open)}
      />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          flexDirection: { xs: 'column', md: 'row' },
          rowGap: { xs: 2, md: 0 }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
          <QueryBoundary fallback={<RosterLoader />}>
            <Box flex="1" minHeight={0}>
              <RosterList
                kickMode={kickMode}
                onKick={onKick}
                kickSelection={selection}
                setKickSelection={setSelection}
              />
            </Box>
            <RosterSummary />
          </QueryBoundary>
        </Box>
        <AutoFixDialog
          isOpen={autoFixOpen}
          onClose={() => setAutoFixOpen(false)}
          records={roster}
          roles={discordRoles}
        />
      </Box>
      <KickModal
        isOpen={kickModalShow}
        onClose={() => setKickModalShow(false)}
        ids={selection}
        onConfirm={() => {
          setSelection([]);
          setKickMode(false);
        }}
      />
    </>
  );
};

export default Roster;
