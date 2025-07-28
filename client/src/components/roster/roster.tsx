import { useCallback, useState } from 'react';
import type MemberRecord from '../../lib/interfaces/member-record';
import KickModal from './kick-modal';
import RosterControl from './roster-control';

import { Box } from '@mui/material';
import { QueryBoundary } from '../common/query-boundary';
import { RosterList } from './member-list';
import { RosterLoader } from './roster-loader';
import { RosterSummary } from './roster-summary';

const Roster = () => {
  const [kickMode, setKickMode] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  const [kickModalShow, setKickModalShow] = useState(false);

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
      />
      <QueryBoundary fallback={<RosterLoader />}>
        <Box flex="1">
          <RosterList
            kickMode={kickMode}
            onKick={onKick}
            kickSelection={selection}
            setKickSelection={setSelection}
          />
        </Box>
        <RosterSummary />
      </QueryBoundary>
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
