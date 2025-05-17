import { Avatar, Box, Skeleton, Typography } from '@mui/material';
import RosterControl from './roster-control';

export const RosterLoader = () => {
  const arr = new Array(50).fill(0);
  return (
    <>
      <RosterControl
        kickMode={false}
        isFetching
        onKick={() => {}}
        selection={[]}
        refetchData={() => {}}
        setKickMode={() => {}}
        setSelection={() => {}}
        disabled
      />
      <Box flex={1}>
        {arr.map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </Box>
    </>
  );
};

const CardSkeleton = () => {
  return (
    <div>
      <Box
        display={'flex'}
        justifyContent="space-between"
        alignItems="center"
        height="62px"
        padding="8px 12px"
      >
        <Box display="flex" gap="4px" alignItems="center">
          <Box>
            <Skeleton variant="circular">
              <Avatar />
            </Skeleton>
          </Box>
          <Box display="flex" flexDirection="column" justifyContent="center" gap="0">
            <Skeleton variant="text">
              <Typography variant="body1" margin="0">
                Account Name
              </Typography>
            </Skeleton>
            <Skeleton variant="text">
              <Typography variant="subtitle2">{new Date().toLocaleDateString()}</Typography>
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
