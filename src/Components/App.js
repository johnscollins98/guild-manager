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
    const discordMem = await DataRetrieval.fetchDiscordMembers();
    setDiscordMembers(discordMem);

    const gw2Mem = await DataRetrieval.fetchGW2Members();
    setGw2Members(gw2Mem);

    const gw2Log = await DataRetrieval.fetchGW2Log();
    setGw2Log(gw2Log);
  };

  const refresh = async () => {
    await fetchData();
  };

  const handleFilterChange = (event) => {
    setFilterString(event.target.value);
  };

  return (
    <Container fluid className="app vh-100">
      <Row>
        <Col>
          <Control refresh={refresh} handleFilterChange={handleFilterChange} />
        </Col>
      </Row>
      <Row className="flex-grow-1 vh-100">
        <Col className="vh-100">
          <Tabs defaultActiveKey="roster">
            <Tab eventKey="roster" title="Roster">
              <Roster
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
            <Tab eventKey="excessDiscord" title="Excess Discord">
              <ExcessDiscord
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
