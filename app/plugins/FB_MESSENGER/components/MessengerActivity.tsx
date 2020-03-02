/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import { Tabs } from 'antd';

import ActivityPerDay from './ActivityPerDay';
import ActivityPerYear from './ActivityPerYear';

const { TabPane } = Tabs;

export default class MessengerActivity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      yearActivity: null,
      activeTab: '0'
    };
  }

  async componentDidUpdate(prevProps, prevState) {
    const { activeTab } = this.state;

    if (prevState.activeTab !== activeTab) {
      const { dataYears } = this.props;
      const toUpdate = {
        yearActivity: activeTab === 0 ? null : dataYears[activeTab - 1]
      };
      if (!activeTab) toUpdate.dataActivity = null;
      this.setState(toUpdate);
    }
  }

  changeYearTab(y) {
    const { dataYears } = this.props;
    this.setState({ activeTab: `${dataYears.indexOf(y) + 1}` });
  }

  handleTabChange(i) {
    const { dataYears } = this.props;
    const toUpdate = { yearActivity: i === 0 ? null : dataYears[i - 1] };
    if (!i) toUpdate.dataActivity = null;
    this.setState({ activeTab: `${i}` });
  }

  render() {
    const { yearActivity, activeTab } = this.state;
    const { dataYears } = this.props;

    return (
      <div>
        <h2>Messenger activity</h2>
        <Tabs
          activeKey={activeTab}
          size="default"
          onChange={i => this.handleTabChange(i)}
        >
          <TabPane tab="All time" key="0">
            <br />
          </TabPane>
          {dataYears.map((y, i) => (
            <TabPane tab={y} key={`${i + 1}`}>
              <br />
            </TabPane>
          ))}
        </Tabs>
        {yearActivity ? (
          <ActivityPerDay
            modelQuery="fbMessengerQueryActivityPerDay"
            year={yearActivity}
          />
        ) : (
          <ActivityPerYear
            modelQuery="fbMessengerQueryActivityPerYear"
            years={dataYears}
            onClick={d => this.changeYearTab(d.year)}
          />
        )}
      </div>
    );
  }
}
