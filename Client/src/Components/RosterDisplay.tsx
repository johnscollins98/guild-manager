import React, { useCallback, useEffect, useState } from 'react';
import RoleEdit from './RoleEdit';
import { filterDataByString } from '../utils/Helpers';
import { kickDiscordMember, setGuildMember } from '../utils/DataRetrieval';

import GuildMemberCard from './GuildMemberCard';
import './RosterDisplay.scss';
import RosterControl from './RosterControl';
import { compareRank } from '../utils/DataProcessing';
import WarningRepository from '../utils/WarningRepository';

import MemberRecord from '../Interfaces/MemberRecord';
import DiscordRole from '../Interfaces/DiscordRole';
import GW2Rank from '../Interfaces/GW2Rank';
import AuthInfo from '../Interfaces/AuthInfo';
import { WarningPost } from '../Interfaces/Warning';

import { Color } from '@material-ui/lab/Alert';
import { MemberInfoPost } from '../Interfaces/MemberInfo';
import { useMutation, useQueryClient } from 'react-query';
import DiscordMember from '../Interfaces/DiscordMember';

interface Props {
  records: MemberRecord[];
  discordRoles: DiscordRole[];
  filterString: string;
  guildRanks: GW2Rank[];
  isFetching: boolean;
  refetchData: () => void;
  openToast: (msg: string, status: Color) => void;
  authInfo?: AuthInfo;
}

const RosterDisplay = ({
  records,
  discordRoles,
  filterString,
  guildRanks,
  openToast,
  isFetching,
  refetchData,
  authInfo = { isAdmin: false, loggedIn: true, isEventLeader: false, username: '' }
}: Props) => {
  const [modalShow, setModalShow] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MemberRecord | null>(null);
  const [recordState, setRecordState] = useState(records);
  const [filteredRecords, setFilteredRecords] = useState(recordState);
  const [singleColumn, setSingleColumn] = useState(false);

  const [sortBy, setSortBy] = useState('rank');
  const [filterBy, setFilterBy] = useState('none');

  useEffect(() => {
    setRecordState(records);
  }, [records]);

  const onSort = useCallback(
    (toSort: MemberRecord[], sortBy: string) => {
      let sorted = [...toSort];
      switch (sortBy) {
        case 'name':
          sorted = sorted.sort((a, b) => {
            const aName = a.accountName || a.discordName || '';
            const bName = b.accountName || b.discordName || '';
            return aName.toLowerCase().localeCompare(bName.toLowerCase());
          });
          break;
        case 'points':
          sorted = sorted.sort((a, b) => {
            const aPoints = a.eventsAttended || -1;
            const bPoints = b.eventsAttended || -1;
            return bPoints - aPoints;
          });
          break;
        case 'rank':
          sorted = sorted.sort((a, b) => {
            const aRank = a.rank || a.roles[0]?.name;
            const bRank = b.rank || b.roles[0]?.name;
            return compareRank(guildRanks, aRank, bRank);
          });
          break;
        case 'date':
          sorted = sorted.sort((a, b) => {
            const aDate = a.joinDate || '1970-01-01T00:00:00.000Z';
            const bDate = b.joinDate || '1970-01-01T00:00:00.000Z';
            return new Date(aDate).valueOf() - new Date(bDate).valueOf();
          });
          break;
        case 'warnings':
          sorted = sorted.sort((a, b) => b.warnings.length - a.warnings.length);
          break;
        default:
          break;
      }
      return sorted;
    },

    [guildRanks]
  );

  const onFilter = useCallback((toFilter: MemberRecord[], filterBy: string) => {
    let filtered = toFilter;
    switch (filterBy) {
      case 'has-gw2':
        filtered = filtered.filter((record) => record.memberId);
        break;
      case 'excess-discord':
        filtered = filtered.filter((record) => !record.memberId);
        break;
      case 'issues':
        filtered = filtered.filter((record) => {
          return Object.values(record.issues).some((k) => k);
        });
        break;
      case 'warnings':
        filtered = filtered.filter((record) => record.warnings.length);
        break;
      case 'none':
        break;
      default:
        break;
    }
    return filtered;
  }, []);

  useEffect(() => {
    const firstFilter = onFilter(recordState, filterBy);
    const stringFilter = filterDataByString(firstFilter, filterString);
    const sorted = onSort(stringFilter, sortBy);
    setFilteredRecords(sorted);
  }, [recordState, sortBy, filterBy, filterString, onFilter, onSort]);

  const queryClient = useQueryClient();
  const kickMutation = useMutation(kickDiscordMember, {
    onMutate: async (discordId: string) => {
      await queryClient.cancelQueries('discordMembers');
      const previousData = queryClient.getQueryData<DiscordMember[]>('discordMembers');

      if (previousData) {
        queryClient.setQueryData(
          'discordMembers',
          previousData.filter((r) => r.id !== discordId)
        );
      }

      return { previousData };
    },
    onError: (err, _, context) => {
      console.error(err);
      openToast('Unable to kick member', 'error');
      queryClient.setQueryData('discordMembers', context?.previousData);
    },
    onSuccess: () => {
      openToast('Kicked Member', 'success');
    },
    onSettled: () => {
      queryClient.invalidateQueries('discordMembers');
    }
  });

  const onKick = useCallback(
    async (record: MemberRecord) => {
      if (!record.discordId) return;

      const res = window.confirm(`Are you sure you want to kick ${record.discordName}?`);
      await queryClient.cancelQueries();
      if (res) {
        kickMutation.mutate(record.discordId);
      }
    },
    [kickMutation, queryClient]
  );

  const openEdit = useCallback(
    (member: MemberRecord) => {
      setSelectedRecord(member);
      setModalShow(true);
    },
    [setModalShow, setSelectedRecord]
  );

  const onGiveWarning = useCallback(
    async (memberId: string, warningObject: WarningPost) => {
      try {
        const newMember = await WarningRepository.addWarning(memberId, warningObject);
        const recordsCopy = [...recordState];
        const toEdit = recordsCopy.find((record) => {
          return record.memberId === newMember.memberId;
        });
        if (!toEdit) throw new Error('Cannot find given member');

        toEdit.warnings = newMember.warnings;
        setRecordState(recordsCopy);
        openToast('Successfully gave warning', 'success');
      } catch (err) {
        console.error(err);
        openToast('There was an error creating the warning', 'error');
      }
    },
    [openToast, recordState]
  );

  const onDeleteWarning = useCallback(
    async (memberId: string, warningId: string) => {
      try {
        const newMember = await WarningRepository.deleteWarning(memberId, warningId);
        const recordsCopy = [...recordState];
        const toEdit = recordsCopy.find((record) => {
          return record.memberId === newMember.memberId;
        });
        if (!toEdit) throw new Error('Cannot find given member');

        toEdit.warnings = newMember.warnings;
        setRecordState(recordsCopy);
        openToast('Successfully removed warning', 'success');
      } catch (err) {
        console.error(err);
        openToast('There was an error deleting the warning', 'error');
      }
    },
    [openToast, recordState]
  );

  const updateMember = useCallback(
    async (newMember: MemberInfoPost) => {
      try {
        const newObject = await setGuildMember(newMember);

        const recordsCopy = [...recordState];
        const toEdit = recordsCopy.find((record) => {
          return record.memberId === newObject.memberId;
        });
        if (!toEdit) throw new Error('Cannot find given member');

        toEdit.eventsAttended = newObject.eventsAttended;

        setRecordState(recordsCopy);
      } catch (err) {
        console.error(err);
        openToast('There was an error updating attendance.', 'error');
      }
    },
    [setRecordState, openToast, recordState]
  );

  const incrementEventAttended = useCallback(
    async (record: MemberRecord) => {
      if (record.memberId && record.eventsAttended !== undefined && record.warnings) {
        const newMember: MemberInfoPost = {
          eventsAttended: record.eventsAttended + 1,
          memberId: record.memberId,
          warnings: record.warnings
        };

        await updateMember(newMember);
      } else {
        throw new Error('Cannot increment points for this member');
      }
    },
    [updateMember]
  );

  const decrementEventAttended = useCallback(
    async (record: MemberRecord) => {
      if (record.memberId && record.eventsAttended !== undefined && record.warnings) {
        if (record.eventsAttended > 0) {
          const newMember: MemberInfoPost = {
            memberId: record.memberId,
            eventsAttended: record.eventsAttended - 1,
            warnings: record.warnings
          };
          await updateMember(newMember);
        }
      } else {
        throw new Error('Cannot decrement points for this member');
      }
    },
    [updateMember]
  );

  return (
    <>
      <RosterControl
        singleColumn={singleColumn}
        setSingleColumn={setSingleColumn}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        refetchData={refetchData}
        isFetching={isFetching}
      />
      <div className="roster-container">
        {filteredRecords.map((record) => (
          <GuildMemberCard
            member={record}
            key={record.memberId || record.discordName}
            discordRoles={discordRoles}
            onKick={onKick}
            onGiveWarning={onGiveWarning}
            onDeleteWarning={onDeleteWarning}
            singleColumn={singleColumn}
            onEdit={openEdit}
            isAdmin={authInfo.isAdmin}
            addPoint={incrementEventAttended}
            removePoint={decrementEventAttended}
          />
        ))}
      </div>
      <RoleEdit
        modalShow={modalShow}
        setModalShow={setModalShow}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        records={recordState}
        setRecords={setRecordState}
        openToast={openToast}
      />
    </>
  );
};

export default RosterDisplay;
