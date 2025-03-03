import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AutoSizer, List } from 'react-virtualized';
import { useAuth } from '../../lib/apis/auth-api';
import type MemberRecord from '../../lib/interfaces/member-record';
import { useFilterString } from '../../lib/utils/use-filter-string';
import GuildMemberCard from './guild-member-card';
import KickModal from './kick-modal';
import RoleEdit from './role-edit';
import RosterControl from './roster-control';

import { useRoster } from './use-roster';

const Roster = () => {
  const filterString = useFilterString();
  const [searchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy') ?? '';
  const filterBy = searchParams.get('filterBy') ?? '';
  const { refetch, discordRoles, rosterForDisplay, roster, isFetching, botRoles } = useRoster(
    sortBy,
    filterString,
    filterBy
  );

  const [kickMode, setKickMode] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  const { data: authInfo } = useAuth();

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

  const selectedRecord = roster.find(r => r.discordId === selectedRecordId);

  return (
    <>
      <RosterControl
        refetchData={refetch}
        isFetching={isFetching}
        kickMode={kickMode}
        setKickMode={setKickMode}
        selection={selection}
        setSelection={setSelection}
        onKick={() => setKickModalShow(true)}
      />
      <div style={{ flex: 1 }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              rowCount={rosterForDisplay.length}
              rowHeight={62}
              rowRenderer={({ index, style }) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const member = rosterForDisplay[index]!;
                return (
                  <div style={style} key={member.memberId ?? member.discordId}>
                    <GuildMemberCard
                      key={member.memberId ?? member.discordId}
                      member={member}
                      discordRoles={discordRoles}
                      botRoles={botRoles}
                      onKick={onKick}
                      onEdit={openEdit}
                      authInfo={authInfo}
                      selection={selection}
                      setSelection={setSelection}
                      kickMode={kickMode}
                    />
                  </div>
                );
              }}
            />
          )}
        </AutoSizer>
      </div>
      <RoleEdit
        modalShow={modalShow}
        setModalShow={setModalShow}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecordId}
      />
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
