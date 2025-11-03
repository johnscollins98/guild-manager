import { useSuspenseQueries } from '@tanstack/react-query';
import { Suspense, use, useMemo } from 'react';
import { WarningTypeLabels, type WarningDTO } from 'server';
import { getMemberOrUserQuery } from '../../lib/apis/discord-api';
import { useWarnings } from '../../lib/apis/warnings-api';
import { getUserAvatar, getUserName } from '../../lib/utils/helpers';
import { useFilterString } from '../../lib/utils/use-filter-string';
import LogEntry from '../common/log-entry';
import { LoadingLogEntry } from '../common/log-loader';
import { FilterContext, SortContext } from './log-setting-context';

export const WarningList = () => {
  const warnings = useWarnings();
  const { sortAscending } = use(SortContext);
  const { warningTypesToDisplay } = use(FilterContext);

  const sorted = useMemo(
    () =>
      warnings.data.toSorted((a, b) => {
        const aDate = new Date(a.timestamp).valueOf();
        const bDate = new Date(b.timestamp).valueOf();
        return sortAscending ? aDate - bDate : bDate - aDate;
      }),
    [warnings.data, sortAscending]
  );

  const filteredByType = useMemo(
    () => sorted.filter(w => warningTypesToDisplay[w.type]),
    [sorted, warningTypesToDisplay]
  );

  return filteredByType.map(e => (
    <Suspense fallback={<LoadingLogEntry />} key={e.id}>
      <Entry warning={e} />
    </Suspense>
  ));
};

const Entry = ({ warning }: { warning: WarningDTO }) => {
  const filterStringLowerCase = useFilterString().toLowerCase();

  const [givenBy, givenTo, lastUpdatedBy] = useSuspenseQueries({
    queries: [
      getMemberOrUserQuery(warning.givenBy),
      getMemberOrUserQuery(warning.givenTo),
      getMemberOrUserQuery(warning.lastUpdatedBy)
    ]
  });

  const avatarUrl = getUserAvatar(givenTo.data);

  const givenToName = getUserName(givenTo.data);
  const givenByName = getUserName(givenBy.data);

  const summary = `[${WarningTypeLabels[warning.type]}] Given to ${givenToName} by ${givenByName}.`;

  if (!summary.toLowerCase().includes(filterStringLowerCase)) {
    return null;
  }

  const details = [warning.reason];

  if (warning.lastUpdatedBy) {
    const updatedMember = getUserName(lastUpdatedBy.data);
    const updatedDate = new Date(warning.lastUpdatedTimestamp);
    details.push(`Last updated on ${updatedDate.toLocaleString()} by ${updatedMember}.`);
  }

  return (
    <LogEntry
      date={new Date(warning.timestamp)}
      key={warning.id}
      details={details}
      avatarUrl={avatarUrl}
    >
      {summary}
    </LogEntry>
  );
};
