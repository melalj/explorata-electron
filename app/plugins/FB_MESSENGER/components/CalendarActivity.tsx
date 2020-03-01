/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import Charty from 'react-charty';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { Spin } from 'antd';

import * as Actions from '../../../state/actions';
import { enumerateDaysBetweenDates, dbDateConvert } from '../../../utils';
import { mainColor } from '../../../constants';
import { queryActivity } from '../model';

const LIGHT_THEME = {
  name: 'light',
  grid: { color: '#182D3B', alpha: 0.1, markerFillColor: '#fff' },
  legend: { background: '#fff', color: '#000' },
  preview: {
    maskColor: '#E2EEF9',
    maskAlpha: 0.6,
    brushColor: '#C0D1E1',
    brushBorderColor: '#fff',
    brushBorderAlpha: 1,
    handleColor: '#fff'
  },
  xAxis: { textColor: '#8E8E93', textAlpha: 1 },
  yAxis: { textColor: '#8E8E93', textAlpha: 1 },
  title: { color: '#000' },
  localRange: { color: '#000' },
  zoomedRange: { color: '#000' },
  zoomText: { color: '#108BE3' },
  zoomIcon: { fill: '#108BE3' },
  buttons: { color: '#fff' },
  pie: { textColor: '#fff' },
  body: { backgroundColor: '#fff', color: '#000', height: 0 },
  noteColor: '#108BE3',
  octoColor: '#fff'
};

class CalendarActivity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  async componentDidMount() {
    const { year } = this.props;
    await this.setData(year);
  }

  async componentDidUpdate(prevProps) {
    const { year } = this.props;
    if (prevProps.year !== year) {
      await this.setData(year);
    }
  }

  async setData(year) {
    const dataActivity = await queryActivity(year);
    const days = enumerateDaysBetweenDates(`${year}-01-01`, `${year}-12-31`);
    const data = { x: [], y0: [] };
    days.forEach(d => {
      const row = dataActivity.find(v => v.day === d);
      data.x.push(dbDateConvert(d).getTime());
      data.y0.push(row ? row.count : 0);
    });
    this.setState({ data });
    this.forceUpdate();
  }

  handleClick(d) {
    const { setFirstDrawer } = this.props;
    if (d && d.time && !Number.isNaN(d.time)) {
      const day = Number(moment(d.time).format('YYYYMMDD'));
      setFirstDrawer('ChatList', { day });
    }
  }

  render() {
    const { data } = this.state;

    if (!data) return <Spin />;

    return (
      <Charty
        title="Messages"
        theme={LIGHT_THEME}
        style={{ width: '100%' }}
        yAxisType="number"
        xAxisType="date"
        rangeTextType="longDate"
        names={{ y0: 'Messages' }}
        colors={{ y0: mainColor }}
        type="bar"
        data={data}
      />
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

export default connect(null, mapDispatchToProps)(CalendarActivity);
