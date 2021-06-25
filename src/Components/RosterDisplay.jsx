import React, { useCallback, useEffect, useState } from 'react';
import RoleEdit from './RoleEdit';
import { filterDataByString } from '../utils/Helpers';
import { kickDiscordMember, setGuildMember } from '../utils/DataRetrieval';

import GuildMemberCard from './GuildMemberCard';
import './RosterDisplay.scss';
import RosterControl from './RosterControl';
import { compareRank } from '../utils/DataProcessing';
import WarningRepository from '../utils/WarningRepository';

const RosterDisplay = ({
  records,
  discordRoles,
  filterString,
  guildRanks,
  openToast,
  authInfo = { isAdmin: false },
}) => {
  const [modalShow, setModalShow] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordState, setRecordState] = useState(records);
  const [filteredRecords, setFilteredRecords] = useState(recordState);
  const [singleColumn, setSingleColumn] = useState(false);

  const [sortBy, setSortBy] = useState('rank');
  const [filterBy, setFilterBy] = useState('none');

  useEffect(() => {
    setRecordState(records);
  }, [records]);

  const onSort = useCallback(
    (toSort, sortBy) => {
      let sorted = [...toSort];
      switch (sortBy) {
        case 'name':
          sorted = sorted.sort((a, b) => {
            const aName = a.accountName || a.discordName;
            const bName = b.accountName || b.discordName;
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
            return new Date(aDate) - new Date(bDate);
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

  const onFilter = useCallback((toFilter, filterBy) => {
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
          return Object.keys(record.issues).some((k) => record.issues[k]);
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

  const onKick = useCallback(
    async (record) => {
      if (!record.discordId) return;

      const res = window.confirm(
        `Are you sure you want to kick ${record.discordName}?`
      );
      if (res) {
        const success = await kickDiscordMember(record.discordId);
        if (success) {
          openToast(`Kicked ${record.discordName} from Discord.`, 'success');
          setRecordState(
            recordState.filter((m) => m.discordId !== record.discordId)
          );
        } else {
          openToast(`Could not kick ${record.discordName}`, 'error');
        }
      }
    },
    [recordState, setRecordState, openToast]
  );

  const openEdit = useCallback(
    (record) => {
      setModalShow(true);
      setSelectedRecord(record);
    },
    [setModalShow, setSelectedRecord]
  );

  const onGiveWarning = useCallback(
    async (memberId, warningObject) => {
      try {
        const newMember = await WarningRepository.addWarning(
          memberId,
          warningObject
        );
        const recordsCopy = [...recordState];
        const toEdit = recordsCopy.find((record) => {
          return record.memberId === newMember.memberId;
        });
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
    async (memberId, warningId) => {
      try {
        const newMember = await WarningRepository.deleteWarning(
          memberId,
          warningId
        );
        const recordsCopy = [...recordState];
        const toEdit = recordsCopy.find((record) => {
          return record.memberId === newMember.memberId;
        });
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

  const changeEventAttended = useCallback(
    async (memberId, eventsAttended) => {
      try {
        const newObject = await setGuildMember({
          memberId,
          eventsAttended,
        });

        const recordsCopy = [...recordState];
        const toEdit = recordsCopy.find((record) => {
          return record.memberId === newObject.memberId;
        });
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
    async (record) => {
      const current = parseInt(record.eventsAttended);
      await changeEventAttended(record.memberId, current + 1);
    },
    [changeEventAttended]
  );

  const decrementEventAttended = useCallback(
    async (record) => {
      const current = parseInt(record.eventsAttended);
      await changeEventAttended(record.memberId, current - 1);
    },
    [changeEventAttended]
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
