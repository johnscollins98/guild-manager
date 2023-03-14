import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MemberRecord from '../../Interfaces/MemberRecord';
import { useAuth } from '../../utils/apis/auth-api';
import { useFilterString } from '../../utils/useFilterString';
import { ErrorMessage } from '../Common/ErrorMessage';
import LoaderPage from '../LoaderPage';
import GuildMemberCard from './GuildMemberCard';
import KickModal from './KickModal';
import RoleEdit from './RoleEdit';
import './Roster.scss';
import RosterControl from './RosterControl';

import { useRoster } from './useRoster';

const Roster = () => {
  const filterString = useFilterString();
  const [searchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy') ?? '';
  const filterBy = searchParams.get('filterBy') ?? '';
  const [fullWidth, setFullWidth] = useState(true);
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
      <RosterControl
        refetchData={refetch}
        isFetching={isFetching}
        fullWidth={fullWidth}
        setFullWidth={setFullWidth}
      />
      <div className="roster-container">
        {roster.map(member => {
          return (
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
              fullWidth={fullWidth}
            />
          );
        })}
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
