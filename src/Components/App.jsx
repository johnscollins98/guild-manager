import React, { useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Toast from 'react-bootstrap/Toast';
import { FaSyncAlt, FaCheckCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  fetchGW2Members,
  fetchGW2Log,
  fetchDiscordMembers,
} from '../utils/DataRetrieval';
import Log from './Log';
import Roster from './Roster';
import Control from './Control';
import ExcessDiscord from './ExcessDiscord';
import RequiredActions from './RequiredActions';

import './App.css';
import { Container, Row, Col } from 'react-bootstrap';

const App = () => {
  const [gw2Log, setGw2Log] = useState([]);
  const [gw2Members, setGw2Members] = useState([]);
  const [discordMembers, setDiscordMembers] = useState([]);
  const [filterString, setFilterString] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastHeader, setToastHeader] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fetchData = async () => {
    let success = false;
    try {
      setLoadingData(true);
      setGw2Members([]);
      setGw2Log([]);
      setDiscordMembers([]);

      const requests = [
        fetchGW2Members().then((r) => setGw2Members(r)),
        fetchGW2Log().then((r) => setGw2Log(r)),
        fetchDiscordMembers().then((r) => setDiscordMembers(r)),
      ];

      await Promise.all(requests);
      success = true;
    } catch (err) {
      openToast(
        'Error',
        'There was an error gathering data. See console for more information.'
      );
    } finally {
      setLoadingData(false);
      return success;
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openToast = (header, message) => {
    setToastHeader(header);
    setToastMessage(message);
    setShowToast(true);
  };

  const closeToast = () => {
    setToastHeader('');
    setToastMessage('');
    setShowToast(false);
  };

  const refresh = async () => {
    const success = await fetchData();
    if (success) openToast('Refresh', 'Successfully refreshed!');
  };

  const handleFilterChange = (event) => {
    setFilterString(event.target.value);
  };

  const TABS = {
    ROSTER: 'Roster',
    EXCESS_DISCORD: 'Excess Discord',
    REQUIRED_ACTIONS: 'Required Actions',
    LOG: 'Log',
  };

  const any = (arr) => arr.length > 0;

  const getTabTitle = (tab) => {
    let loaded = !loadingData;

    if (tab === TABS.LOG) {
      loaded = any(gw2Log);
    } else {
      loaded = any(gw2Members) && any(discordMembers);
    }
    return (
      <span className="tab-title">
        {loaded ? <FaCheckCircle className="loaded" /> : <FaSyncAlt />}
        &nbsp;
        {tab}
      </span>
    );
  };

  return (
    <Container fluid className="app bg-dark vh-100">
      <Toast
        show={showToast}
        onClose={() => closeToast()}
        delay={2000}
        className="rounded"
        style={{
          position: 'absolute',
          top: '15px',
          left: 'calc(50% - 150px)',
          width: '300px',
          margin: 'auto',
          zIndex: '5000',
        }}
        autohide
      >
        <Toast.Header>{toastHeader}</Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
      <Row>
        <Col>
          <Control
            refresh={refresh}
            handleFilterChange={handleFilterChange}
            loadingData={loadingData}
          />
        </Col>
      </Row>
      <Row className="flex-grow-1">
        <Col className="tab-container">
          <Tabs defaultActiveKey="roster" className="bg-dark">
            <Tab eventKey="roster" title={getTabTitle(TABS.ROSTER)}>
              <Roster
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                filterString={filterString}
                openToast={openToast}
              />
            </Tab>
            <Tab
              eventKey="excessDiscord"
              title={getTabTitle(TABS.EXCESS_DISCORD)}
            >
              <ExcessDiscord
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                filterString={filterString}
                openToast={openToast}
              />
            </Tab>
            <Tab eventKey="actions" title={getTabTitle(TABS.REQUIRED_ACTIONS)}>
              <RequiredActions
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                filterString={filterString}
                openToast={openToast}
              />
            </Tab>
            <Tab eventKey="log" title={getTabTitle(TABS.LOG)}>
              <Log data={gw2Log} filterString={filterString} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
