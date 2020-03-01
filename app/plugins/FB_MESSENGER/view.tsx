/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import { min, range } from 'd3-array';
import { Row, Col, Divider } from 'antd';

import MessengerActivity from './components/MessengerActivity';
import MostMessaged from './components/MostMessaged';
import Chattiest from './components/Chattiest';
import RatioSent from './components/RatioSent';
import Drawers from './components/Drawers';

import { queryYears } from './model';

export default class ViewFbMessenger extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataYears: null
    };
  }

  async componentDidMount() {
    const rawYears = await queryYears();
    const yearMin = min(rawYears);
    const dataYears = range(yearMin, new Date().getFullYear() + 1, 1);
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
            <MostMessaged dataYears={dataYears} />
          </Col>
          <Col span={12}>
            <Chattiest dataYears={dataYears} />
          </Col>
        </Row>
        <Row gutter={28}>
          <Col span={12}>
            <RatioSent dataYears={dataYears} isGhosters />
          </Col>
          <Col span={12}>
            <RatioSent dataYears={dataYears} />
          </Col>
        </Row>
      </div>
    );
  }
}
