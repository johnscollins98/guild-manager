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
          <TableCell>New Point Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ourData.map((entry) => (
          <TableRow>
            <TableCell>{entry.givenBy}</TableCell>
            <TableCell>{entry.givenTo}</TableCell>
            <TableCell>{entry.newVal}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PointLog;
