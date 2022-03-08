import React, { useCallback, useEffect, useState } from 'react';
import RoleEdit from './RoleEdit';
import { filterDataByString } from '../../utils/Helpers';
import { changeDiscordMember, kickDiscordMember } from '../../utils/DataRetrieval';

import GuildMemberCard from './GuildMemberCard';
import './RosterDisplay.scss';
import RosterControl from './RosterControl';
import { compareRank } from '../../utils/DataProcessing';
import WarningRepository from '../../utils/WarningRepository';

import MemberRecord from '../../Interfaces/MemberRecord';
import DiscordRole from '../../Interfaces/DiscordRole';
import GW2Rank from '../../Interfaces/GW2Rank';
import AuthInfo from '../../Interfaces/AuthInfo';
import { WarningPost } from '../../Interfaces/Warning';

import { Color } from '@material-ui/lab/Alert';
import { useMutation, useQueryClient } from 'react-query';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import Grid from 'react-virtualized/dist/commonjs/Grid';
import 'react-virtualized/styles.css';
import DiscordMember from '../../Interfaces/DiscordMember';

const COLUMN_MIN_WIDTH = 300;
const MAX_NUM_COLS = 5;
const MIN_NUM_COLS = 1;
const ROW_HEIGHT = 79;
const numColsHelper = (width: number) => {
  for (let i = MAX_NUM_COLS; i > 0; i--) {
    if (width / i > COLUMN_MIN_WIDTH) return i;
  }
  return MIN_NUM_COLS;
};

interface Props {
  records: MemberRecord[];
  discordRoles: DiscordRole[];
  filterString: string;
  guildRanks: GW2Rank[];
  isFetching: boolean;
  refetchData: () => void;
  openToast: (msg: string, status: Color) => void;
  sortBy: string;
  setSortBy: (setSortBy: string) => void;
  filterBy: string;
  setFilterBy: (setFilterBy: string) => void;
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
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy,
  authInfo = { isAdmin: false, loggedIn: true, username: '' }
}: Props) => {
  const [modalShow, setModalShow] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MemberRecord | null>(null);
  const [recordState, setRecordState] = useState(records);
  const [filteredRecords, setFilteredRecords] = useState(recordState);
  const [singleColumn, setSingleColumn] = useState(true);

  

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
        case 'rank':
          sorted = sorted.sort((a, b) => {
            const aRank = a.rank || a.roles[0]?.name;
            const bRank = b.rank || b.roles[0]?.name;
            return compareRank(guildRanks, aRank, bRank);
          });
          break;
        case 'date':
          sorted = sorted.sort((a, b) => {
            return a.joinDate.diff(b.joinDate).toMillis();
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

  const onEditNickname = useCallback(
    async (member: MemberRecord) => {
      const newNickname = window.prompt(
        'Enter new nickname: ',
        member.nickname || member.discordName || ''
      );
      if (newNickname) {
        try {
          if (!member.discordId) {
            throw new Error('Discord ID not found for given member');
          }

          await changeDiscordMember(member.discordId, newNickname);
          const recordCopy = [...recordState];
          const toEdit = recordCopy.find((record) => record.discordId === member.discordId);
          if (!toEdit) {
            throw new Error('Cannot find given member');
          }

          toEdit.discordName = newNickname;
          setRecordState(recordCopy);
          openToast(`Successfully updated nickname to ${newNickname}`, 'success');
          refetchData();
        } catch (err) {
          openToast('There was an error changing the nickname', 'error');
          console.error(err);
        }
      }
    },
    [openToast, recordState, refetchData]
  );

  const onGiveWarning = useCallback(
    async (warningObject: WarningPost) => {
      try {
        const newWarning = await WarningRepository.addWarning(warningObject);
        const recordsCopy = [...recordState];
        const toEdit = recordsCopy.find((record) => {
          return record.memberId === newWarning.givenTo;
        });
        if (!toEdit) throw new Error('Cannot find given member');

        toEdit.warnings = [...toEdit.warnings, newWarning];
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
    async (warningId: string) => {
      try {
        const newWarning = await WarningRepository.deleteWarning(warningId);
        const recordsCopy = [...recordState];
        const toEdit = recordsCopy.find((record) => {
          return record.memberId === newWarning.givenTo;
        });
        if (!toEdit) throw new Error('Cannot find given member');

        toEdit.warnings = toEdit.warnings.filter(w => w._id !== newWarning._id);
        setRecordState(recordsCopy);
        openToast('Successfully removed warning', 'success');
      } catch (err) {
        console.error(err);
        openToast('There was an error deleting the warning', 'error');
      }
    },
    [openToast, recordState]
  );

  const memberRenderer = useCallback(
    ({ key, rowIndex, columnIndex, style }, numCols) => {
      const index = rowIndex * numCols + columnIndex;
      const member = filteredRecords[index];
      if (!member) return null;

      return (
        <div key={key} style={{ ...style, padding: 5 }}>
          <GuildMemberCard
            member={member}
            discordRoles={discordRoles}
            onKick={onKick}
            onGiveWarning={onGiveWarning}
            onDeleteWarning={onDeleteWarning}
            singleColumn={singleColumn}
            onEdit={openEdit}
            onChangeNickname={onEditNickname}
            isAdmin={authInfo.isAdmin}
          />
        </div>
      );
    },
    [
      singleColumn,
      discordRoles,
      authInfo.isAdmin,
      filteredRecords,
      onKick,
      onGiveWarning,
      onDeleteWarning,
      openEdit,
      onEditNickname
    ]
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
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => {
            const numCols = singleColumn ? 1 : numColsHelper(width);
            const columnWidth = (width - 5) / numCols;
            const numRows = Math.ceil(filteredRecords.length / numCols);

            return (
              <Grid
                height={height}
                width={width}
                columnCount={numCols}
                columnWidth={columnWidth}
                rowHeight={ROW_HEIGHT}
                rowCount={numRows}
                cellRenderer={(props) => memberRenderer(props, numCols)}
              />
            );
          }}
        </AutoSizer>
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
