/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/prop-types */
import React from 'react';
import { Avatar, List, Spin, Button } from 'antd';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';

import * as Actions from '../../../state/actions';

class ChatList extends React.Component {
  constructor(props) {
    super(props);
    this.modelQuery = props.modelQuery;
    this.state = {
      dataChatList: null
    };
  }

  async componentDidMount() {
    const { firstDrawer } = this.props;

    const dataChatList = await ipcRenderer.invoke(
      this.modelQuery,
      firstDrawer.filters
    );
    this.setState({ dataChatList });
  }

  async componentDidUpdate(prevProps) {
    const { firstDrawer } = this.props;
    if (prevProps.firstDrawer.filters !== firstDrawer.filters) {
      this.setState({ dataChatList: null });
      const dataChatList = await ipcRenderer.invoke(
        this.modelQuery,
        firstDrawer.filters
      );
      this.setState({ dataChatList });
    }
  }

  handleItemClick(d) {
    const { firstDrawer, setSecondDrawer } = this.props;
    const filters = { ...firstDrawer.filters, person: d.person };
    setSecondDrawer('ChatMessages', filters);
  }

  handleProfileClick(person) {
    const { setFirstDrawer } = this.props;
    setFirstDrawer('FriendProfile', { person });
  }

  render() {
    const { dataChatList } = this.state;
    if (!dataChatList) return <Spin />;
    return (
      <List
        dataSource={dataChatList}
        bordered
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={[
              <Button
                key="profile"
                onClick={() => this.handleProfileClick(item.person)}
              >
                Profile
              </Button>,
              <Button
                key="messages"
                type="primary"
                onClick={() => this.handleItemClick(item)}
              >
                Read messages
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar>{item.person.substr(0, 1).toUpperCase()}</Avatar>}
              title={<a>{item.person}</a>}
              description={`${item.count} messages`}
            />
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
      setFirstDrawer: (t, f) => Actions.setFirstDrawer(t, f),
      setSecondDrawer: (t, f) => Actions.setSecondDrawer(t, f)
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatList);
