/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React from 'react';
import { Spin, DatePicker, Divider, Empty } from 'antd';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import moment from 'moment';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

class ChatMessages extends React.Component {
  constructor(props) {
    super(props);
    this.modelQuery = props.modelQuery;
    this.state = {
      data: null,
      dayFrom: props.secondDrawer.filters.dayFrom || null,
      dayTo: props.secondDrawer.filters.dayTo || null
    };
  }

  async componentDidMount() {
    const { dayFrom, dayTo } = this.state;
    const data = await ipcRenderer.invoke(this.modelQuery, this.getFilters());
    const toUpdate = { data };
    if (!dayFrom) toUpdate.dayFrom = data[0].day;
    if (!dayTo) toUpdate.dayTo = data[data.length - 1].day;
    this.setState(toUpdate);
  }

  async componentDidUpdate(prevProps, prevState) {
    const { secondDrawer } = this.props;
    const { dayFrom, dayTo } = this.state;
    if (prevProps.secondDrawer.filters !== secondDrawer.filters) {
      this.setState({ data: null });
      const data = await ipcRenderer.invoke(this.modelQuery, this.getFilters());
      const toUpdate = { data };
      if (!dayFrom) toUpdate.dayFrom = data[0].day;
      if (!dayTo) toUpdate.dayTo = data[data.length - 1].day;
      this.setState(toUpdate);
    }
    if (prevState.dayFrom !== dayFrom || prevState.dayTo !== dayTo) {
      this.setState({ data: null });
      const data = await ipcRenderer.invoke(this.modelQuery, this.getFilters());
      this.setState({ data });
    }
  }

  getFilters() {
    const { dayFrom, dayTo } = this.state;
    const { secondDrawer } = this.props;
    return {
      person: secondDrawer.filters.person,
      dayFrom,
      dayTo
    };
  }

  handleDateChange(r) {
    this.setState({
      dayFrom: r[0].format(dateFormat),
      dayTo: r[1].format(dateFormat)
    });
  }

  render() {
    const { data, dayFrom, dayTo } = this.state;
    if (!data) return <Spin />;

    if (!data.length) return <Empty />;
    return (
      <section className="discussion">
        <RangePicker
          defaultValue={[
            moment(dayFrom, dateFormat),
            moment(dayTo, dateFormat)
          ]}
          onCalendarChange={v => this.handleDateChange(v)}
        />
        <Divider />
        {data.slice(0, 5000).map((d, i) => {
          const p = d.sender ? 'sender' : 'receiver';

          const isMiddle =
            i > 0 &&
            i < data.length - 1 &&
            data[i][p] === data[i + 1][p] &&
            data[i][p] === data[i - 1][p];

          const isFirst =
            !isMiddle && (i === 0 || data[i][p] !== data[i - 1][p]);

          const bubbleClassNames = classNames('bubble', {
            sender: d.sender,
            recipient: d.receiver,
            first: isFirst,
            last:
              !isFirst &&
              (i === data.length - 1 || data[i][p] !== data[i + 1][p]),
            middle: isMiddle
          });
          return (
            <div className="chatrow" key={`chat-${i}`}>
              {isFirst ? (
                <div className="time">
                  {new Date(d.timestamp).toLocaleString()}
                </div>
              ) : null}
              <div className={bubbleClassNames}>{d.content}</div>
            </div>
          );
        })}
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    secondDrawer: state.secondDrawer
  };
}

export default connect(mapStateToProps)(ChatMessages);
