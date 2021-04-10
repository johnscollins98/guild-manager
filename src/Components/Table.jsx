import React from 'react';
import PropTypes from 'prop-types';
import MUTable from '@material-ui/core/Table';

const Table = ({ children }) => (
  <MUTable size="small" stickyHeader>
    {children}
  </MUTable>
);

Table.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default Table;
