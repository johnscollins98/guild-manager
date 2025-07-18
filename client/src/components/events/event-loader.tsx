import { Avatar, Skeleton, Typography } from '@mui/material';
import { Box } from '@mui/system';

export const EventLoader = () => {
  const events = new Array(20).fill(0);
  return (
    <Box display="flex" flexWrap="wrap" sx={{ gap: { md: '4px' } }}>
      {events.map((_, idx) => (
        <Box
          key={idx}
          sx={t => ({
            border: { md: `1px solid ${t.palette.divider}` },
            borderBottom: `1px solid ${t.palette.divider}`,
            borderRadius: { md: '4px' },
            flexBasis: { xs: '100%', md: 'calc(50% - 4px)' },
            flexGrow: 0
          })}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding="8px 16px"
          gap={2}
        >
          <Box display="flex" flexDirection="column" flex="1">
            <Typography sx={{ fontSize: '1.1rem' }} component="div">
              <Skeleton>
                <Typography fontSize="1.1rem" component="div">
                  Event Name
                </Typography>
              </Skeleton>
            </Typography>
            <Typography variant="caption" component="div">
              <Skeleton>
                <Typography variant="caption" component="div">
                  Monday at 12:00 for 1h
                </Typography>
              </Skeleton>
            </Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Skeleton variant="circular">
              <Avatar sx={{ width: '32px', height: '32px' }}></Avatar>
            </Skeleton>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
