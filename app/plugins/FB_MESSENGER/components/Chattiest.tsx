/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import { Select, Empty } from 'antd';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList
} from 'recharts';
import millify from 'millify';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { queryChattiest } from '../model';
import * as Actions from '../../../state/actions';
import { mainColor } from '../../../constants';
import { dbDateConvert } from '../../../utils';

const allTime = 'All Time';

class Chattiest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      yearChattiest: allTime,
      dataChattiest: null
    };
  }

  async componentDidMount() {
    const { yearChattiest } = this.state;
    const dataChattiest = await queryChattiest(
      yearChattiest === allTime ? null : yearChattiest
    );
    this.setState({ dataChattiest, isReady: true });
  }

  async componentDidUpdate(prevProps, prevState) {
    const { yearChattiest } = this.state;
    if (prevState.yearChattiest !== yearChattiest) {
      const dataChattiest = await queryChattiest(
        yearChattiest === 'All Time' ? null : yearChattiest
      );
      this.setState({ dataChattiest });
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
    const filters = { day: d.day };
    setFirstDrawer('ChatList', filters);
  }

  render() {
    const { dataChattiest, isReady, yearChattiest } = this.state;
    const { dataYears } = this.props;

    if (!isReady || !dataChattiest) return null;

    const yearChattiestHandler = k => {
      this.setState({ yearChattiest: k });
    };
    const formatAxis = v =>
      dbDateConvert(v)
        .toISOString()
        .split('T')[0];

    return (
      <div>
        <div>
          <div style={{ float: 'right' }}>
            <Select
              defaultValue={yearChattiest}
              size="default"
              onChange={y => yearChattiestHandler(y)}
            >
              <Select.Option key="0" value={allTime}>
                {allTime}
              </Select.Option>
              {dataYears.map(y => (
                <Select.Option key={y} value={y}>
                  {y}
                </Select.Option>
              ))}
            </Select>
          </div>
          <h2>Chattiest Days</h2>
        </div>
        {dataChattiest.length ? (
          <ResponsiveContainer aspect={0.75} width="100%">
            <BarChart
              data={dataChattiest}
              layout="vertical"
              onClick={d => this.handleClick(d)}
              margin={{
                top: 5,
                right: 50,
                left: 60,
                bottom: 5
              }}
            >
              <XAxis
                domain={[0, 'dataMin', 'dataMax']}
                allowDecimals={false}
                name="Messages"
                type="number"
                tickFormatter={v => millify(v, { precision: 0 })}
              />
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <Tooltip />
              <Bar
                dataKey="count"
                fill={mainColor}
                barSize={50}
                animationDuration={300}
                radius={[0, 10, 10, 0]}
              >
                <LabelList dataKey="count" position="right" />
              </Bar>
              <YAxis
                dataKey="day"
                type="category"
                name="Day"
                tickFormatter={v => formatAxis(v)}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
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

export default connect(null, mapDispatchToProps)(Chattiest);
