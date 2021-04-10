import React from 'react';
import PropTypes from 'prop-types';

import Table from './Table';
import { filterLogByString } from '../utils/Helpers';
import { TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

const Log = ({ data, filterString }) => {
  data = filterLogByString(data, filterString);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Time</TableCell>
          <TableCell>Entry</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((record, i) => (
          <TableRow key={i}>
            <TableCell>{record.date}</TableCell>
            <TableCell>{record.time}</TableCell>
            <TableCell>{record.message}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

Log.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    }).isRequired
  ),
  filterString: PropTypes.string.isRequired,
};

export default Log;
