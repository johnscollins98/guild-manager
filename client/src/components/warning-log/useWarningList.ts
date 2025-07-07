import { useSuspenseQueries } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { type WarningType, WarningTypeLabels } from 'server';
import { discordMembersQuery } from '../../lib/apis/discord-api';
import { warningsQuery } from '../../lib/apis/warnings-api';
import { useFilterString } from '../../lib/utils/use-filter-string';

export const useWarningList = (warningTypesToDisplay: Record<WarningType, boolean>) => {
  const [{ data: warnings }, { data: discordMembers }] = useSuspenseQueries({
    queries: [warningsQuery, discordMembersQuery]
  });

  const filterStringLowerCase = useFilterString().toLowerCase();

  const getMemberName = useCallback(
    (id: string) => {
      const member = discordMembers.find(m => m.id === id);

      return member?.nickname || member?.name || 'Unknown Member';
    },
    [discordMembers]
  );

  const logEntries = useMemo(
    () =>
      warnings.map(w => {
        const date = new Date(w.timestamp);

        const givenTo = getMemberName(w.givenTo);
        const givenBy = getMemberName(w.givenBy);

        const summary = `[${WarningTypeLabels[w.type]}] Given to ${givenTo} by ${givenBy}.`;

        const details = [w.reason];

        if (w.lastUpdatedBy) {
          const updatedMember = getMemberName(w.lastUpdatedBy);
          const updatedDate = new Date(w.lastUpdatedTimestamp);
          details.push(`Last updated on ${updatedDate.toLocaleString()} by ${updatedMember}.`);
        }

        return {
          date,
          summary,
          details,
          type: w.type,
          id: w.id
        };
      }),
    [getMemberName, warnings]
  );

  const filtered = useMemo(
    () =>
      logEntries.filter(
        e =>
          warningTypesToDisplay[e.type] && e.summary.toLowerCase().includes(filterStringLowerCase)
      ),
    [filterStringLowerCase, logEntries, warningTypesToDisplay]
  );

  return filtered;
};
