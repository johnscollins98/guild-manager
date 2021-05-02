import { TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import Table from './Table';

const PointLog = ({ data, filterString }) => {
  const [ourData, setOurData] = useState([]);

  useEffect(() => {
    const filtered = data.filter(
      (entry) =>
        entry.givenBy.includes(filterString) ||
        entry.givenTo.includes(filterString)
    );
    setOurData(filtered);
  }, [data, filterString]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Changed by</TableCell>
          <TableCell>Change to</TableCell>
          <TableCell>Old Point Value</TableCell>
          <TableCell>New Point Value</TableCell>
          <TableCell>Change</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ourData.map((entry) => (
          <TableRow>
            <TableCell>{entry.givenBy}</TableCell>
            <TableCell>{entry.givenTo}</TableCell>
            <TableCell>{entry.oldVal || '-'}</TableCell>
            <TableCell>{entry.newVal}</TableCell>
            <TableCell>
              {entry.oldVal && entry.newVal ? (
                <>
                  {entry.newVal - entry.oldVal > 0 ? '+' : null}
                  {entry.newVal - entry.oldVal}
                </>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PointLog;
