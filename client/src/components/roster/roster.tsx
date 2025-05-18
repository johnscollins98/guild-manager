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
  const [selectedRecord, setSelectedRecordId] = useState<MemberRecord | undefined>(undefined);

  const openEdit = useCallback((member: MemberRecord) => {
    setSelectedRecordId(member);
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
      <Box flex="1" overflow="auto">
        <QueryBoundary fallback={<RosterLoader />}>
          <RosterList
            kickMode={kickMode}
            onEdit={openEdit}
            onKick={onKick}
            selection={selection}
            setSelection={setSelection}
          />
        </QueryBoundary>
      </Box>
      <Suspense>
        <RoleEdit
          modalShow={modalShow}
          setModalShow={setModalShow}
          selectedRecord={selectedRecord}
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
