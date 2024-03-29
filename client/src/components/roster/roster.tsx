import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { useAuth } from '../../lib/apis/auth-api';
import MemberRecord from '../../lib/interfaces/member-record';
import { useFilterString } from '../../lib/utils/use-filter-string';
import { ErrorMessage } from '../common/error-message';
import LoaderPage from '../common/loader-page';
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
  const { isLoading, isFetching, refetch, isError, discordRoles, rosterForDisplay, roster } =
    useRoster(sortBy, filterString, filterBy);

  const [kickMode, setKickMode] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  const { data: authInfo } = useAuth();

  const [modalShow, setModalShow] = useState(false);
  const [kickModalShow, setKickModalShow] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(undefined);

  const openEdit = (member: MemberRecord) => {
    setSelectedRecordId(member.discordId);
    setModalShow(true);
  };

  if (isError) return <ErrorMessage>There was an error getting roster data.</ErrorMessage>;

  if (isLoading || !roster || !rosterForDisplay || !discordRoles) return <LoaderPage />;

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
            <List height={height} width={width} itemCount={rosterForDisplay.length} itemSize={76}>
              {({ index, style }) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const member = rosterForDisplay[index]!;
                return (
                  <div style={style}>
                    <GuildMemberCard
                      key={member.memberId ?? member.discordId}
                      member={member}
                      discordRoles={discordRoles}
                      onKick={record => {
                        if (record.discordId) {
                          setSelection([record.discordId]);
                          setKickModalShow(true);
                        }
                      }}
                      onEdit={openEdit}
                      isAdmin={authInfo?.isAdmin ?? false}
                      selection={selection}
                      setSelection={setSelection}
                      kickMode={kickMode}
                    />
                  </div>
                );
              }}
            </List>
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
