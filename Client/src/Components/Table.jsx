import React from 'react';
import PropTypes from 'prop-types';
import MUTable from '@material-ui/core/Table';

const Table = ({ children }) => (
  <div style={{ flex: 'auto', overflow: 'auto' }}>
    <MUTable size="small" stickyHeader>
      {children}
    </MUTable>
  </div>
);

Table.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default Table;
