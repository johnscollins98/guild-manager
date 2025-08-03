import { Box, Table, TableCell, TableRow } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDiscordMembers } from '../../../lib/apis/discord-api';
import { useWarningById } from '../../../lib/apis/warnings-api';
import NotFound from '../../not-found';

export const SingleWarningPage = () => {
  const { warningId } = useParams();

  if (!warningId) {
    return <NotFound />;
  }

  const warningIdNum = parseInt(warningId!);

  if (isNaN(warningIdNum)) {
    return <NotFound />;
  }

  return <Content warningId={warningIdNum} />;
};

const Content = ({ warningId }: { warningId: number }) => {
  const warningQuery = useWarningById(warningId);
  const discordMembers = useDiscordMembers();

  const warning = warningQuery.data;

  if (!warning) {
    return <NotFound />;
  }

  const givenTo = discordMembers.data.find(m => m.id === warning.givenTo);
  const givenBy = discordMembers.data.find(m => m.id === warning.givenBy);
  const updatedBy = warning.lastUpdatedBy
    ? discordMembers.data.find(m => m.id === warning.lastUpdatedBy)
    : undefined;

  return (
    <Box>
      <Table>
        <TableRow>
          <TableCell>
            <b>Given By</b>
          </TableCell>
          <TableCell>{givenBy?.name ?? 'Unknown User'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Given To</b>
          </TableCell>
          <TableCell>{givenTo?.name ?? 'Unknown user'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Type</b>
          </TableCell>
          <TableCell sx={{ textTransform: 'capitalize' }}>{warning.type}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Date</b>
          </TableCell>
          <TableCell>{new Date(warning.timestamp).toLocaleString()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Last Updated</b>
          </TableCell>
          <TableCell>
            {warning.lastUpdatedBy ? new Date(warning.lastUpdatedTimestamp).toLocaleString() : ''}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Last Updated By</b>
          </TableCell>
          <TableCell>{warning.lastUpdatedBy ? (updatedBy?.name ?? 'Unknown User') : ''}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <b>Reason</b>
          </TableCell>
          <TableCell>{warning.reason}</TableCell>
        </TableRow>
      </Table>
    </Box>
  );
};
