import { Suspense, useCallback, useState } from 'react';
import type MemberRecord from '../../lib/interfaces/member-record';
import KickModal from './kick-modal';
import RoleEdit from './role-edit';
import RosterControl from './roster-control';

import { Box } from '@mui/material';
import { QueryBoundary } from '../common/query-boundary';
import { RosterList } from './member-list';
import { RosterLoader } from './roster-loader';

const Roster = () => {
  const [kickMode, setKickMode] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  const [modalShow, setModalShow] = useState(false);
  const [kickModalShow, setKickModalShow] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(undefined);

  const openEdit = useCallback((member: MemberRecord) => {
    setSelectedRecordId(member.discordId);
    setModalShow(true);
  }, []);

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
            onEdit={openEdit}
            onKick={onKick}
            selection={selection}
            setSelection={setSelection}
          />
        </Box>
      </QueryBoundary>
      <Suspense>
        <RoleEdit
          modalShow={modalShow}
          setModalShow={setModalShow}
          selectedRecordId={selectedRecordId}
          setSelectedRecord={setSelectedRecordId}
        />
      </Suspense>
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
