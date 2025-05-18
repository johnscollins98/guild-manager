import { Avatar, Box, Skeleton, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { getDateString } from '../../lib/utils/data-processing';

export const RosterLoader = () => {
  const arr = new Array(25).fill(0);
  return (
    <Box height="100%" overflow="auto" maxHeight="100%">
      {arr.map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </Box>
  );
};

const CardSkeleton = () => {
  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        height="58px"
        marginBottom="4px"
        padding="8px 12px"
      >
        <Box display="flex" gap="8px" alignItems="center">
          <Box>
            <Skeleton variant="circular">
              <Avatar sx={{ height: '32px', width: '32px' }} />
            </Skeleton>
          </Box>
          <Box display="flex" flexDirection="column" justifyContent="center" gap="0">
            <Skeleton variant="text">
              <Typography variant="body1" margin="0">
                Account Name
              </Typography>
            </Skeleton>
            <Skeleton variant="text">
              <Typography variant="subtitle2" fontSize="12px" fontWeight="300">
                {getDateString(DateTime.now())}
              </Typography>
            </Skeleton>
          </Box>
        </Box>
        <Box display="flex" gap="4px">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
      </Box>
    </div>
  );
};
