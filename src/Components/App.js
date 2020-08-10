import React, { useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import "bootstrap/dist/css/bootstrap.min.css";

import DataRetrieval from "../utils/DataRetrieval";

import Log from "./Log";
import Roster from "./Roster";
import Control from "./Control";
import ExcessDiscord from "./ExcessDiscord";
import RequiredActions from "./RequiredActions";

import "./App.css";
import { Container, Row, Col } from "react-bootstrap";

const App = () => {
  const [gw2Log, setGw2Log] = useState([]);
  const [gw2Members, setGw2Members] = useState([]);
  const [discordMembers, setDiscordMembers] = useState([]);
  const [filterString, setFilterString] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const gw2Log = DataRetrieval.fetchGW2Log();
    const discordMem = DataRetrieval.fetchDiscordMembers();
    const gw2Mem = DataRetrieval.fetchGW2Members();

    gw2Log.then((r) => setGw2Log(r));
    discordMem.then((r) => setDiscordMembers(r));
    gw2Mem.then((r) => setGw2Members(r));

    await Promise.allSettled([discordMem, gw2Mem, gw2Log]);
  };

  const refresh = async () => {
    await fetchData();
  };

  const handleFilterChange = (event) => {
    setFilterString(event.target.value);
  };

  return (
    <Container fluid className="app bg-dark vh-100">
      <Row>
        <Col>
          <Control refresh={refresh} handleFilterChange={handleFilterChange} />
        </Col>
      </Row>
      <Row className="flex-grow-1 vh-100">
        <Col className="vh-100">
          <Tabs defaultActiveKey="roster" className="bg-dark">
            <Tab eventKey="roster" title="Roster">
              <Roster
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                filterString={filterString}
              />
            </Tab>
            <Tab eventKey="excessDiscord" title="Excess Discord">
              <ExcessDiscord
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                filterString={filterString}
              />
            </Tab>
            <Tab eventKey="actions" title="Required Actions">
              <RequiredActions
                gw2Members={gw2Members}
                discordMembers={discordMembers}
                filterString={filterString}
              />
            </Tab>
            <Tab eventKey="log" title="Log">
              <Log data={gw2Log} filterString={filterString} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
