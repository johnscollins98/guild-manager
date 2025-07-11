import { Box } from '@mui/material';
import { LogLoader } from '../common/log-loader';
import { QueryBoundary } from '../common/query-boundary';
import { WarningLogBar } from './log-bar/warning-log-bar';
import { WarningLogSettingsProvider } from './log-setting-context';
import { WarningList } from './warning-list';

export const WarningLog = () => {
  return (
    <WarningLogSettingsProvider>
      <Box display="flex" flexDirection="column" sx={{ overflowY: 'hidden' }}>
        <WarningLogBar />
        <Box sx={{ overflowX: 'hidden', overflowY: 'auto', flex: '1' }}>
          <QueryBoundary fallback={<LogLoader />}>
            <WarningList />
          </QueryBoundary>
        </Box>
      </Box>
    </WarningLogSettingsProvider>
  );
};
