/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import { Avatar, List, Spin } from 'antd';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { queryChatList } from '../model';
import * as Actions from '../../../state/actions';

class ChatList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataChatList: null
    };
  }

  async componentDidMount() {
    const { firstDrawer } = this.props;
    const dataChatList = await queryChatList(firstDrawer.filters);
    this.setState({ dataChatList });
  }

  async componentDidUpdate(prevProps) {
    const { firstDrawer } = this.props;
    if (prevProps.firstDrawer.filters !== firstDrawer.filters) {
      const dataChatList = await queryChatList(firstDrawer.filters);
      this.setState({ dataChatList });
    }
  }

  handleItemClick(d) {
    const { firstDrawer, setSecondDrawer } = this.props;
    const filters = { person: d.person };
    if (firstDrawer.filters.day) filters.day = firstDrawer.filters.day;
    setSecondDrawer('ChatMessages', filters);
  }

  render() {
    const { dataChatList } = this.state;
    if (!dataChatList) return <Spin />;
    return (
      <List
        dataSource={dataChatList}
        bordered
        renderItem={item => (
          <List.Item key={item.id} onClick={() => this.handleItemClick(item)}>
            <List.Item.Meta
              avatar={<Avatar>{item.person.substr(0, 1).toUpperCase()}</Avatar>}
              title={<a>{item.person}</a>}
              description={`${item.count} messages`}
            />
            <div className="chatlist-time">
              {new Date(item.timestamp).toISOString().split('T')[0]}
            </div>
          </List.Item>
        )}
      />
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

export default connect(mapStateToProps, mapDispatchToProps)(ChatList);
