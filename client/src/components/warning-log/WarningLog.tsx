import { Box } from '@mui/material';
import { QueryBoundary } from '../common/query-boundary';
import { LogLoader } from '../log/log-loader';
import { WarningLogSettingsProvider } from './LogSettingContext';
import { WarningList } from './WarningList';
import { WarningLogBar } from './log-bar/WarningLogBar';

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
