import React from 'react';
import PropTypes from 'prop-types';
import BSTable from 'react-bootstrap/Table';

const Table = ({ children }) => (
  <BSTable striped bordered hover size="sm" variant="dark">
    {children}
  </BSTable>
);

Table.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default Table;
