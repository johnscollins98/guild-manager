import React from "react";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Spinner from "react-bootstrap/Spinner";
import PropTypes from "prop-types";

const Control = ({ refresh, handleFilterChange, loadingData }) => {

  const onRefresh = async () => {
    await refresh();
  };

  const refreshButton = () => {
    if (loadingData) {
      return <Spinner animation="border" variant="primary" className="refresh-spinner" />
    } else {
      return (
        <button className="btn ml-2 btn-primary" onClick={() => onRefresh()}>
          Refresh
        </button>
      )
    }
  }

  return (
    <InputGroup className="mb-3">
      <InputGroup.Prepend>
        <InputGroup.Text id="basic-addon1" className="text-white">
          Filter
        </InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl
        placeholder="Type here to filter for any column..."
        aria-label="Filter"
        aria-describedby="basic-addon1"
        className="bg-dark text-white"
        onChange={handleFilterChange}
      />
      {refreshButton()}
    </InputGroup>
  );
};

Control.propTypes = {
  refresh: PropTypes.func.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
};

export default Control;
