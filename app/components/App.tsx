/* eslint-disable react/prop-types */ // TODO: Use prop types

import React from 'react';
import { connect } from 'react-redux';

import { screens } from '../constants';

import Dropfiles from './Dropfiles';
import Loading from './Loading';
import Dashboard from './Dashboard';

function App({ isLoading, currentScreen }) {
  return (
    <div className="App">
      {isLoading ? <Loading /> : null}
      {currentScreen === screens.DASHBOARD ? <Dashboard /> : <Dropfiles />}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    isLoading: state.isLoading,
    currentScreen: state.currentScreen
  };
}

export default connect(mapStateToProps)(App);
