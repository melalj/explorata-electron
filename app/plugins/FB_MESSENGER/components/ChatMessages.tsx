/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React from 'react';
import { Spin } from 'antd';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { queryChatMessages } from '../model';

class ChatMessages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  async componentDidMount() {
    const { secondDrawer } = this.props;
    const data = await queryChatMessages(secondDrawer.filters);
    this.setState({ data });
  }

  async componentDidUpdate(prevProps) {
    const { secondDrawer } = this.props;
    if (prevProps.secondDrawer.filters !== secondDrawer.filters) {
      const data = await queryChatMessages(secondDrawer.filters);
      this.setState({ data });
    }
  }

  render() {
    const { data } = this.state;
    if (!data) return <Spin />;
    return (
      <section className="discussion">
        {data.map((d, i) => {
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
