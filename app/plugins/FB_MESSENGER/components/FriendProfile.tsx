/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import { Statistic, Row, Col, Button, Card, Tag, Spin } from 'antd';
import millify from 'millify';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { queryFriendProfile } from '../model';
import * as Actions from '../../../state/actions';

class FriendProfile extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = {
      dataFriendProfile: null
    };
  }

  async componentDidMount() {
    const { firstDrawer } = this.props;
    const dataFriendProfile = await queryFriendProfile(
      firstDrawer.filters.person
    );
    this.setState({ dataFriendProfile });
    this.mounted = true;
  }

  async componentDidUpdate(prevProps) {
    if (!this.mounted) return;
    const { firstDrawer } = this.props;
    if (prevProps.firstDrawer.filters !== firstDrawer.filters) {
      const dataFriendProfile = await queryFriendProfile(
        firstDrawer.filters.person
      );
      this.setState({ dataFriendProfile });
    }
  }

  handleOpenConversationClick() {
    const { firstDrawer, setSecondDrawer } = this.props;
    setSecondDrawer('ChatMessages', firstDrawer.filters);
  }

  render() {
    const { dataFriendProfile } = this.state;
    if (!dataFriendProfile) return <Spin />;

    const dt = dataFriendProfile;
    return (
      <div>
        <h2>Messages</h2>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <Statistic
                title="First Message"
                value={dt.firstMessage}
                formatter={v => new Date(v).toISOString().split('T')[0]}
              />
              <br />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic title="Best streak" suffix="days" value={dt.streak} />
              <Tag color="purple">{`started on ${dt.streakFrom}`}</Tag>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Sent"
                value={dt.messagesSent}
                suffix="messages"
                formatter={v => millify(v, { precision: 1 })}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Received"
                suffix="messages"
                value={dt.messagesReceived}
                formatter={v => millify(v, { precision: 1 })}
              />
            </Card>
          </Col>
        </Row>
        <div align="center">
          <Button
            size="large"
            type="primary"
            onClick={() => this.handleOpenConversationClick()}
          >
            Read all messages
          </Button>
        </div>
        <h2>Emoji</h2>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Most Sent"
                value={`${
                  !dt.mostSentEmoji.length
                    ? 'N/A'
                    : dt.mostSentEmoji
                        .slice(0, 3)
                        .map(d => d[0])
                        .join(' ')
                }`}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Most Received"
                value={`${
                  !dt.mostReceivedEmoji.length
                    ? 'N/A'
                    : dt.mostReceivedEmoji
                        .slice(0, 3)
                        .map(d => d[0])
                        .join(' ')
                }`}
              />
            </Card>
          </Col>
        </Row>
        <h2>GIF</h2>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Sent"
                suffix="GIFs"
                value={dt.gifSent}
                formatter={v => millify(v, { precision: 0 })}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Received"
                suffix="GIFs"
                value={dt.gifReceived}
                formatter={v => millify(v, { precision: 0 })}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    firstDrawer: state.firstDrawer
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      setSecondDrawer: (t, f) => Actions.setSecondDrawer(t, f)
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(FriendProfile);
