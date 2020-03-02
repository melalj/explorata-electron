/* eslint-disable react/no-unused-state */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import millify from 'millify';
import { Spin } from 'antd';
import { ipcRenderer } from 'electron';

import { mainColor } from '../../../constants';

export default class ActivityPerYear extends Component {
  constructor(props) {
    super(props);
    this.modelQuery = props.modelQuery;
    this.state = {
      dataActivity: null
    };
  }

  async componentDidMount() {
    const dataActivity = await ipcRenderer.invoke(this.modelQuery);
    this.setState({ dataActivity });
  }

  handleClick(activeItem) {
    const { onClick } = this.props;
    if (
      !activeItem ||
      !activeItem.activePayload ||
      !activeItem.activePayload[0]
    )
      return;
    const d = activeItem.activePayload[0].payload;
    onClick(d);
  }

  render() {
    const { dataActivity } = this.state;
    const { years } = this.props;
    if (!dataActivity) return <Spin />;

    const data = years.map(d => {
      const row = dataActivity[String(d)];
      const count = row ? Number(row) : 0;
      return { year: d, count };
    });

    return (
      <div style={{ margin: 10 }}>
        <ResponsiveContainer aspect={4} width="100%">
          <BarChart
            data={data}
            onClick={v => this.handleClick(v)}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <YAxis
              domain={['dataMin', 'dataMax']}
              name="Messages"
              allowDecimals={false}
              tickFormatter={v => millify(v, { precision: 0 })}
            />
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <Tooltip />
            <Bar
              dataKey="count"
              fill={mainColor}
              animationDuration={300}
              radius={[10, 10, 0, 0]}
            />
            <XAxis dataKey="year" name="Year" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
