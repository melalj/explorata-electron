/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import millify from 'millify';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { Spin } from 'antd';
import { ipcRenderer } from 'electron';

import * as Actions from '../../../state/actions';
import { enumerateDaysBetweenDates } from '../../../utils';
import { mainColor } from '../../../constants';

class ActivityPerYear extends React.Component {
  constructor(props) {
    super(props);
    this.modelQuery = props.modelQuery;
    this.state = {
      dataActivity: null
    };
  }

  async componentDidMount() {
    const { year } = this.props;
    const dataActivity = await ipcRenderer.invoke(this.modelQuery, year);
    this.setState({ dataActivity });
  }

  async componentDidUpdate(prevProps) {
    const { year } = this.props;
    if (prevProps.year !== year) {
      const dataActivity = await ipcRenderer.invoke(this.modelQuery, year);
      this.setState({ dataActivity });
    }
  }

  handleClick(activeItem) {
    const { setFirstDrawer } = this.props;
    if (
      !activeItem ||
      !activeItem.activePayload ||
      !activeItem.activePayload[0]
    )
      return;
    const d = activeItem.activePayload[0].payload;
    if (d && d.time && !Number.isNaN(d.time)) {
      const dayTo = moment(d.time);
      dayTo.add(1, 'day');
      const day = moment(d.time).format('YYYY-MM-DD');
      setFirstDrawer('ChatList', {
        dayFrom: day,
        dayTo: dayTo.format('YYYY-MM-DD')
      });
    }
  }

  render() {
    const { year } = this.props;
    const { dataActivity } = this.state;

    if (!dataActivity) return <Spin />;

    const days = enumerateDaysBetweenDates(`${year}-01-01`, `${year}-12-31`);
    const data = days.map(d => {
      const row = dataActivity[d];
      const count = row ? Number(row) : 0;
      return { time: new Date(d).getTime(), count };
    });

    return (
      <ResponsiveContainer aspect={4} width="100%">
        <AreaChart
          data={data}
          onClick={d => this.handleClick(d)}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <YAxis
            domain={['dataMin', 'dataMax']}
            allowDecimals={false}
            tickFormatter={v => millify(Number(v), { precision: 0 })}
          />
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <Tooltip
            formatter={v => [
              `${millify(Number(v), { precision: 0 })} Messages`
            ]}
            labelFormatter={name => [moment(name).format('YYYY-MM-DD')]}
          />
          <Area
            type="monotone"
            dataKey="count"
            animationDuration={300}
            stroke={mainColor}
            fillOpacity={0.3}
            fill={mainColor}
          />
          <XAxis
            dataKey="time"
            scale="time"
            domain={['auto', 'auto']}
            tickCount={12}
            name="Day"
            tickFormatter={d => moment(d).format('MMM DD')}
            type="number"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      setFirstDrawer: (t, f) => Actions.setFirstDrawer(t, f)
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(ActivityPerYear);
