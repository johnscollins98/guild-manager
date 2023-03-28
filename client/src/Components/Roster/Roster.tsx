import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import MemberRecord from '../../interfaces/MemberRecord';
import { useAuth } from '../../utils/apis/auth-api';
import { useFilterString } from '../../utils/useFilterString';
import { ErrorMessage } from '../Common/ErrorMessage';
import LoaderPage from '../LoaderPage';
import GuildMemberCard from './GuildMemberCard';
import KickModal from './KickModal';
import RoleEdit from './RoleEdit';
import RosterControl from './RosterControl';

import { useRoster } from './useRoster';

const Roster = () => {
  const filterString = useFilterString();
  const [searchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy') ?? '';
  const filterBy = searchParams.get('filterBy') ?? '';
  const { isLoading, isFetching, refetch, isError, discordRoles, roster } = useRoster(
    sortBy,
    filterString,
    filterBy
  );
  const { data: authInfo } = useAuth();

  const [modalShow, setModalShow] = useState(false);
  const [kickModalShow, setKickModalShow] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(undefined);

  const openEdit = (member: MemberRecord) => {
    setSelectedRecordId(member.discordId);
    setModalShow(true);
  };

  if (isError) return <ErrorMessage>There was an error getting roster data.</ErrorMessage>;

  if (isLoading || !roster || !discordRoles) return <LoaderPage />;

  const selectedRecord = roster.find(r => r.discordId === selectedRecordId);

  return (
    <>
      <RosterControl refetchData={refetch} isFetching={isFetching} />
      <div style={{ flex: 1 }}>
        <AutoSizer>
          {({ height, width }) => (
            <List height={height} width={width} itemCount={roster.length} itemSize={76}>
              {({ index, style }) => {
                const member = roster[index];
                return (
                  <div style={style}>
                    <GuildMemberCard
                      key={member.memberId ?? member.discordId}
                      member={member}
                      discordRoles={discordRoles}
                      onKick={record => {
                        setSelectedRecordId(record.discordId);
                        setKickModalShow(true);
                      }}
                      onEdit={openEdit}
                      isAdmin={authInfo?.isAdmin ?? false}
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
      {selectedRecord && (
        <KickModal
          isOpen={kickModalShow}
          onClose={() => setKickModalShow(false)}
          user={selectedRecord}
        />
      )}
    </>
  );
};

export default Roster;
