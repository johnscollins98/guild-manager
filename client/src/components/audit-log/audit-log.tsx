import { Box, Button } from '@mui/material';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Action, type AuditLogEntry } from 'server';
import { auditLogQuery } from '../../lib/apis/audit-log-api';
import { useEventById } from '../../lib/apis/event-api';
import { useWarningById } from '../../lib/apis/warnings-api';
import LogEntry from '../common/log-entry';
import { LoadingLogEntry } from '../common/log-loader';
import { useMemberNames, useRoleById } from './hooks';

const queryFn = ({ pageParam }: { pageParam: string }) => {
  return auditLogQuery(100, pageParam ? new Date(pageParam) : undefined).queryFn();
};

export const AuditLog = () => {
  const auditLog = useSuspenseInfiniteQuery({
    initialPageParam: '',
    queryKey: auditLogQuery(100).queryKey,
    queryFn,
    getNextPageParam: lastPage => {
      const lastEntry = lastPage[lastPage.length - 1];
      if (!lastEntry) return null;

      return new Date(lastEntry.timestamp).toISOString();
    },
    select: data => data.pages.reduce((total, page) => [...total, ...page])
  });

  return (
    <Box overflow="auto" sx={{ overflowAnchor: 'none' }}>
      {auditLog.data.map(l => (
        <Suspense key={l.id} fallback={<LoadingLogEntry />}>
          <LogEntry date={new Date(l.timestamp)}>
            <Entry data={l} />
          </LogEntry>
        </Suspense>
      ))}
      {auditLog.hasNextPage && (
        <Box display="flex" justifyContent="center">
          <Button
            onClick={() => auditLog.fetchNextPage()}
            loading={auditLog.isFetching}
            loadingPosition="end"
          >
            Load more
          </Button>
        </Box>
      )}
    </Box>
  );
};

const Entry = ({ data }: { data: AuditLogEntry }) => {
  switch (data.action) {
    case Action.USER_KICK:
      return <UserKicked data={data} />;
    case Action.USER_ROLE_ADD:
      return <UserRoleAdd data={data} />;
    case Action.USER_ROLE_REMOVE:
      return <UserRoleRemove data={data} />;
    case Action.USER_NICK_CHANGE:
      return <UserNickChanged data={data} />;
    case Action.USER_ASSOCIATE:
      return <UserAssociate data={data} />;
    case Action.USER_REMOVE_ASSOCIATION:
      return <UserRemoveAssociate data={data} />;
    case Action.WARNING_ADD:
      return <WarningAdd data={data} />;
    case Action.WARNING_REMOVE:
      return <WarningRemove data={data} />;
    case Action.WARNING_UPDATE:
      return <WarningUpdate data={data} />;
    case Action.EVENT_ADD:
      return <EventCreate data={data} />;
    case Action.EVENT_REMOVE:
      return <EventDelete data={data} />;
    case Action.EVENT_UPDATE:
      return <EventUpdate data={data} />;
    case Action.EVENT_POST:
      return <EventPost data={data} />;
    case Action.RECRUITMENTPOST_UPDATE:
      return <RecruitmentPostUpdate data={data} />;
    default:
      return <></>;
  }
};

interface Props {
  data: AuditLogEntry;
}

const UserKicked = ({ data }: Props) => {
  const { sourceName, targetName } = useMemberNames(data);
  return `${targetName} kicked by ${sourceName}`;
};

const UserRoleAdd = ({ data }: Props) => {
  const { sourceName, targetName } = useMemberNames(data);
  const role = useRoleById(data.roleId);

  return `${sourceName} added ${role?.name ?? 'Unknown'} role to ${targetName}`;
};

const UserRoleRemove = ({ data }: Props) => {
  const { sourceName, targetName } = useMemberNames(data);
  const role = useRoleById(data.roleId);

  return `${sourceName} removed ${role?.name ?? 'Unknown'} role from ${targetName}`;
};

const UserNickChanged = ({ data }: Props) => {
  const { sourceName, targetName } = useMemberNames(data);
  return `${sourceName} updated ${targetName}'s nickname to ${data.nick}`;
};

const UserAssociate = ({ data }: Props) => {
  const { sourceName, targetName } = useMemberNames(data);
  return `${sourceName} associated ${targetName} to ${data.gw2AccountName}`;
};

const UserRemoveAssociate = ({ data }: Props) => {
  const { sourceName, targetName } = useMemberNames(data);
  return `${sourceName} removed the association of ${targetName} to ${data.gw2AccountName}`;
};

const WarningAdd = ({ data }: Props) => {
  const { sourceName, targetName } = useMemberNames(data);
  const warningQuery = useWarningById(data.warningId!);
  const warning = warningQuery.data;

  return (
    <>
      {sourceName} added{' '}
      {warning ? (
        <Link to={`/warnings/${data.warningId}`}>an {warning.type} warning</Link>
      ) : (
        'a warning'
      )}{' '}
      for {targetName}.
    </>
  );
};

const WarningRemove = ({ data }: Props) => {
  const { sourceName, targetName } = useMemberNames(data);
  return `${sourceName} removed a warning for ${targetName}`;
};

const WarningUpdate = ({ data }: Props) => {
  const { sourceName, targetName } = useMemberNames(data);
  const warningQuery = useWarningById(data.warningId!);
  const warning = warningQuery.data;

  return (
    <>
      {sourceName} updated{' '}
      {warning ? (
        <Link to={`/warnings/${data.warningId}`}>an {warning.type} warning</Link>
      ) : (
        'a warning'
      )}{' '}
      for {targetName}
    </>
  );
};

const EventCreate = ({ data }: Props) => {
  const { sourceName } = useMemberNames(data);
  const eventQuery = useEventById(data.eventId!);
  const event = eventQuery.data;

  return event ? (
    <>
      {sourceName} created the <Link to={`/events/${event.id}`}>{event.title}</Link> event.
    </>
  ) : (
    `${sourceName} created an unknown event.`
  );
};

const EventDelete = ({ data }: Props) => {
  const { sourceName } = useMemberNames(data);

  return `${sourceName} deleted an event.`;
};

const EventUpdate = ({ data }: Props) => {
  const { sourceName } = useMemberNames(data);
  const eventQuery = useEventById(data.eventId!);
  const event = eventQuery.data;

  return event ? (
    <>
      {sourceName} updated the <Link to={`/events/${event.id}`}>{event.title}</Link> event.
    </>
  ) : (
    `${sourceName} updated an unknown event.`
  );
};

const EventPost = ({ data }: Props) => {
  const { sourceName } = useMemberNames(data);

  return `${sourceName} posted events to discord.`;
};

const RecruitmentPostUpdate = ({ data }: Props) => {
  const { sourceName } = useMemberNames(data);
  return `${sourceName} updated the recruitment post.`;
};
