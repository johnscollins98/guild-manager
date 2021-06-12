import React, { useCallback, useEffect, useState } from 'react';
import RoleEdit from './RoleEdit';
import { filterDataByString } from '../utils/Helpers';
import { kickDiscordMember, setGuildMember } from '../utils/DataRetrieval';

import GuildMemberCard from './GuildMemberCard';
import './RosterDisplay.scss';
import LoaderPage from './LoaderPage';

const RosterDisplay = ({
  records,
  discordRoles,
  filterString,
  openToast,
  authInfo,
}) => {
  const [modalShow, setModalShow] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordState, setRecordState] = useState(records);
  const [filteredRecords, setFilteredRecords] = useState(recordState);
  const [allDataLoaded, setAllDataLoaded] = useState(false);

  const [adminActionsEnabled, setAdminActionsEnabled] = useState(false);

  useEffect(() => {
    if (authInfo && records.length && discordRoles.length) {
      setAllDataLoaded(true);
    } else {
      setAllDataLoaded(false);
    }
  }, [authInfo, records, discordRoles, setAllDataLoaded]);

  useEffect(() => {
    setAdminActionsEnabled(authInfo.isAdmin);
  }, [authInfo]);

  useEffect(() => {
    setRecordState(records);
  }, [records]);

  useEffect(() => {
    setFilteredRecords(filterDataByString(recordState, filterString));
  }, [recordState, filterString]);

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

  return !allDataLoaded ? (
    <LoaderPage />
  ) : (
    <>
      <div className="roster-container">
        {filteredRecords.map((record) => (
          <GuildMemberCard
            member={record}
            key={record.memberId}
            discordRoles={discordRoles}
            onKick={onKick}
            onEdit={openEdit}
            isAdmin={adminActionsEnabled}
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
