import React from 'react';
import MUTable from '@material-ui/core/Table';

const Table = ({ children }) => (
  <div style={{ flex: 'auto', overflow: 'auto' }}>
    <MUTable size="small" stickyHeader>
      {children}
    </MUTable>
  </div>
);

export default Table;
