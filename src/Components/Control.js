import React, { useState } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Toast from "react-bootstrap/Toast";
import PropTypes from "prop-types";

const Control = ({ refresh, handleFilterChange }) => {
  const [showToast, setShowToast] = useState(false);

  const onRefresh = async () => {
    await refresh();
    setShowToast(true);
  };

  return (
    <InputGroup className="mb-3">
      <InputGroup.Prepend>
        <InputGroup.Text id="basic-addon1">Filter</InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl
        placeholder="Type here to filter for any column..."
        aria-label="Filter"
        aria-describedby="basic-addon1"
        onChange={handleFilterChange}
      />
      <button className="btn ml-2 btn-primary" onClick={() => onRefresh()}>
        Refresh
      </button>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        className="rounded"
        style={{
          position: "absolute",
          top: "15px",
          left: "calc(50% - 150px)",
          width: "300px",
          margin: "auto",
        }}
        autohide
      >
        <Toast.Header>Resfresh</Toast.Header>
        <Toast.Body>Successfully refreshed!</Toast.Body>
      </Toast>
    </InputGroup>
  );
};

Control.propTypes = {
  refresh: PropTypes.func.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
};

export default Control;
