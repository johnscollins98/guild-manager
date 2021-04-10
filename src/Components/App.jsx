import React, { useCallback, useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Toast from 'react-bootstrap/Toast';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FaSyncAlt, FaCheckCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  fetchGW2Members,
  fetchGW2Log,
  fetchDiscordMembers,
  fetchAuthInfo,
} from '../utils/DataRetrieval';
import Log from './Log';
import Roster from './Roster';
import Control from './Control';
import ExcessDiscord from './ExcessDiscord';
import RequiredActions from './RequiredActions';
import PointsLeaderboard from './PointsLeaderboard';

import './App.scss';

const App = () => {
  const [gw2Log, setGw2Log] = useState([]);
  const [gw2Members, setGw2Members] = useState([]);
  const [discordMembers, setDiscordMembers] = useState([]);
  const [authInfo, setAuthInfo] = useState({});
  const [filterString, setFilterString] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastHeader, setToastHeader] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const openToast = useCallback(
    (header, message) => {
      setToastHeader(header);
      setToastMessage(message);
      setShowToast(true);
    },
    [setToastHeader, setToastMessage, setShowToast]
  );

  const closeToast = useCallback(() => {
    setToastHeader('');
    setToastMessage('');
    setShowToast(false);
  }, [setToastMessage, setToastHeader, setShowToast]);

  const fetchData = useCallback(async () => {
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
        fetchAuthInfo().then((r) => setAuthInfo(r)),
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
  }, [setLoadingData, setGw2Members, setGw2Log, setDiscordMembers, openToast]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    const success = await fetchData();
    if (success) openToast('Refresh', 'Successfully refreshed!');
  }, [fetchData, openToast]);

  const handleFilterChange = useCallback(
    (event) => {
      setFilterString(event.target.value);
    },
    [setFilterString]
  );

  const TABS = {
    ROSTER: 'Roster',
    EXCESS_DISCORD: 'Excess Discord',
    REQUIRED_ACTIONS: 'Required Actions',
    LEADERBOARD: 'Points Leaderboard',
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
                authInfo={authInfo}
                openToast={openToast}
              />
            </Tab>
            <Tab eventKey="leaderboard" title={getTabTitle(TABS.LEADERBOARD)}>
              <PointsLeaderboard
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                filterString={filterString}
                authInfo={authInfo}
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
                authInfo={authInfo}
                openToast={openToast}
              />
            </Tab>
            <Tab eventKey="actions" title={getTabTitle(TABS.REQUIRED_ACTIONS)}>
              <RequiredActions
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                filterString={filterString}
                authInfo={authInfo}
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
