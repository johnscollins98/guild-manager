import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
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
import { useFilterString } from '../../lib/utils/use-filter-string';

const Roster = () => {
  const [kickMode, setKickMode] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  const [kickModalShow, setKickModalShow] = useState(false);
  const [autoFixOpen, setAutoFixOpen] = useState(false);

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
      <QueryBoundary fallback={<RosterLoader />}>
        <RosterContent
          kickMode={kickMode}
          selection={selection}
          setSelection={setSelection}
          onKick={onKick}
          autoFixOpen={autoFixOpen}
          onCloseAutoFix={() => setAutoFixOpen(false)}
        />
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

interface RosterContentProps {
  kickMode: boolean;
  selection: string[];
  setSelection: Dispatch<SetStateAction<string[]>>;
  onKick: (member: MemberRecord) => void;
  autoFixOpen: boolean;
  onCloseAutoFix: () => void;
}

const RosterContent = ({
  kickMode,
  selection,
  setSelection,
  onKick,
  autoFixOpen,
  onCloseAutoFix
}: RosterContentProps) => {
  const [searchParams] = useSearchParams();
  const filterString = useFilterString();
  const { roster, rosterForDisplay, discordRoles, inviteCount, gw2MemberCount, discordMemberCount } =
    useRoster(
      searchParams.get('sortBy') ?? '',
      searchParams.get('sortOrder') === 'ASC',
      filterString,
      searchParams.get('filterBy') ?? ''
    );

  return (
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
        <Box flex="1" minHeight={0}>
          <RosterList
            kickMode={kickMode}
            onKick={onKick}
            kickSelection={selection}
            setKickSelection={setSelection}
            discordRoles={discordRoles}
            rosterForDisplay={rosterForDisplay}
            roster={roster}
          />
        </Box>
        <RosterSummary
          inviteCount={inviteCount}
          gw2MemberCount={gw2MemberCount}
          discordMemberCount={discordMemberCount}
        />
      </Box>
      <AutoFixDialog
        isOpen={autoFixOpen}
        onClose={onCloseAutoFix}
        records={roster}
        roles={discordRoles}
      />
    </Box>
  );
};

export default Roster;
