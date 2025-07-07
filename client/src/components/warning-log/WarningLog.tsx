import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import { Box, Button, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import { useState } from 'react';
import { WarningTypeLabels, type WarningType } from 'server';
import { QueryBoundary } from '../common/query-boundary';
import DiscordLogEntry from '../discord-log/discord-log-entry';
import { LogLoader } from '../log/log-loader';
import { useWarningList } from './useWarningList';

export const WarningLog = () => {
  const [warningTypesToDisplay, setWarningTypesToDisplay] = useState<Record<WarningType, boolean>>({
    event: true,
    informal: true,
    official: true
  });

  const [sortAscending, setSortAscending] = useState(false);

  return (
    <Box display="flex" flexDirection="column" sx={{ overflowY: 'hidden' }}>
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Tooltip
            title={`Click to put ${sortAscending ? 'most recent' : 'old'} entries at the top.`}
          >
            <Button
              onClick={() => setSortAscending(!sortAscending)}
              startIcon={sortAscending ? <ArrowUpward /> : <ArrowDownward />}
            >
              {sortAscending ? 'Oldest at the top' : 'Newest at the top'}
            </Button>
          </Tooltip>
        </Box>
        <Box>
          {Object.entries(warningTypesToDisplay).map(([key, value]) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={value}
                  onClick={() =>
                    setWarningTypesToDisplay({ ...warningTypesToDisplay, [key]: !value })
                  }
                />
              }
              label={WarningTypeLabels[key as WarningType]}
              key={key}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ overflowX: 'hidden', overflowY: 'auto', flex: '1' }}>
        <QueryBoundary fallback={<LogLoader />}>
          <WarningList
            warningTypesToDisplay={warningTypesToDisplay}
            sortAscending={sortAscending}
          />
        </QueryBoundary>
      </Box>
    </Box>
  );
};

const WarningList = ({
  warningTypesToDisplay,
  sortAscending
}: {
  warningTypesToDisplay: Record<WarningType, boolean>;
  sortAscending: boolean;
}) => {
  const logEntries = useWarningList(warningTypesToDisplay, sortAscending);
  return logEntries.map(e => (
    <DiscordLogEntry
      date={e.date}
      key={e.id}
      displayEntry={{ summary: e.summary, details: e.details }}
    />
  ));
};
