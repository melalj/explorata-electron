/* eslint-disable react/prop-types */
import React from 'react';
import { Drawer } from 'antd';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../../state/actions';

import ChatList from './ChatList';
import ChatMessages from './ChatMessages';
import FriendProfile from './FriendProfile';

class Drawers extends React.Component {
  getFirstDrawerTitle() {
    const { firstDrawer } = this.props;
    const { typeDrawer, filters } = firstDrawer;
    if (typeDrawer === 'ChatList' && filters && filters.day) {
      return `Messages on ${filters.day}`;
    }
    if (typeDrawer === 'FriendProfile' && filters && filters.person) {
      return `${filters.person} Report`;
    }
    return null;
  }

  getSecondDrawerTitle() {
    const { secondDrawer } = this.props;
    const { typeDrawer, filters } = secondDrawer;
    if (typeDrawer === 'ChatMessages' && filters && filters.person) {
      return `${filters.person} • Messages`;
    }
    return null;
  }

  getFirstDrawerContent() {
    const { firstDrawer } = this.props;
    const { typeDrawer, filters } = firstDrawer;
    if (typeDrawer === 'ChatList' && filters) {
      return <ChatList modelQuery="fbMessengerQueryChatList" />;
    }
    if (typeDrawer === 'FriendProfile' && filters) {
      return <FriendProfile modelQuery="fbMessengerQueryFriendProfile" />;
    }
    return null;
  }

  getSecondDrawerContent() {
    const { secondDrawer } = this.props;
    const { typeDrawer, filters } = secondDrawer;

    if (typeDrawer === 'ChatMessages' && filters && filters.person) {
      return <ChatMessages modelQuery="fbMessengerQueryChatMessages" />;
    }
    return null;
  }

  render() {
    const {
      firstDrawer,
      secondDrawer,
      hideFirstDrawer,
      hideSecondDrawer
    } = this.props;

    return (
      <Drawer
        title={this.getFirstDrawerTitle()}
        width={700}
        closable={false}
        onClose={hideFirstDrawer}
        visible={firstDrawer.visible}
      >
        {this.getFirstDrawerContent()}
        <Drawer
          title={this.getSecondDrawerTitle()}
          width={600}
          closable
          onClose={hideSecondDrawer}
          visible={secondDrawer.visible}
        >
          {this.getSecondDrawerContent()}
        </Drawer>
      </Drawer>
    );
  }
}

function mapStateToProps(state) {
  return {
    firstDrawer: state.firstDrawer,
    secondDrawer: state.secondDrawer
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      hideFirstDrawer: () => Actions.hideFirstDrawer(),
      setFirstDrawer: (t, f) => Actions.setFirstDrawer(t, f),
      hideSecondDrawer: () => Actions.hideSecondDrawer(),
      setSecondDrawer: (t, f) => Actions.setSecondDrawer(t, f)
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Drawers);
