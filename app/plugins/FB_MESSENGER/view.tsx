/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import { Row, Col, Divider } from 'antd';
import { ipcRenderer } from 'electron';

import MessengerActivity from './components/MessengerActivity';
import MostMessaged from './components/MostMessaged';
import BestStreaks from './components/BestStreaks';
import RatioSent from './components/RatioSent';
import Drawers from './components/Drawers';

export default class ViewFbMessenger extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataYears: null
    };
  }

  async componentDidMount() {
    const dataYears = await ipcRenderer.invoke('fbMessengerQueryYears');
    this.setState({ dataYears });
  }

  render() {
    const { dataYears } = this.state;
    if (!dataYears) return null;

    return (
      <div>
        <Drawers />
        <Divider />
        <MessengerActivity dataYears={dataYears} />
        <br />
        <Row gutter={28}>
          <Col span={12}>
            <MostMessaged
              modelQuery="fbMessengerQueryMostMessaged"
              dataYears={dataYears}
            />
          </Col>
          <Col span={12}>
            <BestStreaks
              modelQuery="fbMessengerQueryBestStreaks"
              dataYears={dataYears}
            />
          </Col>
        </Row>
        <Row gutter={28}>
          <Col span={12}>
            <RatioSent
              modelQuery="fbMessengerQueryRatioSent"
              dataYears={dataYears}
            />
          </Col>
          <Col span={12}>
            <RatioSent
              modelQuery="fbMessengerQueryRatioSent"
              dataYears={dataYears}
              isGhosters
            />
          </Col>
        </Row>
      </div>
    );
  }
}
