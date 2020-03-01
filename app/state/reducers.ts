import { combineReducers } from 'redux';
import * as Actions from './actions';
import initial from './initial';

function isLoading(state = initial.isLoading, action) {
  switch (action.type) {
    case Actions.SET_LOADING:
      return action.isLoading;
    default:
      return state;
  }
}

function currentScreen(state = initial.currentScreen, action) {
  switch (action.type) {
    case Actions.SET_CURRENT_SCREEN:
      return action.currentScreen;
    default:
      return state;
  }
}

function droppedFiles(state = initial.droppedFiles, action) {
  switch (action.type) {
    case Actions.SET_DROPPED_FILES:
      return action.droppedFiles;
    default:
      return state;
  }
}

function currentReport(state = initial.currentReport, action) {
  switch (action.type) {
    case Actions.SET_CURRENT_REPORT:
      return action.currentReport;
    default:
      return state;
  }
}

function error(state = initial.error, action) {
  switch (action.type) {
    case Actions.SET_ERROR:
      return action.error;
    default:
      return state;
  }
}

// TODO: isolate in a separate reduce (maybe inside /plugins)
// FB_MESSENGER

function firstDrawer(state = initial.firstDrawer, action) {
  switch (action.type) {
    case Actions.SHOW_FIRST_DRAWER:
      return { ...state, visible: true };
    case Actions.HIDE_FIRST_DRAWER:
      return { ...state, visible: false };
    case Actions.SET_FIRST_DRAWER:
      return {
        visible: action.visible,
        typeDrawer: action.typeDrawer,
        filters: action.filters
      };
    default:
      return state;
  }
}

function secondDrawer(state = initial.secondDrawer, action) {
  switch (action.type) {
    case Actions.SHOW_SECOND_DRAWER:
      return { ...state, visible: true };
    case Actions.HIDE_SECOND_DRAWER:
      return { ...state, visible: false };
    case Actions.SET_SECOND_DRAWER:
      return {
        visible: action.visible,
        typeDrawer: action.typeDrawer,
        filters: action.filters
      };
    default:
      return state;
  }
}

export default () =>
  combineReducers({
    isLoading,
    currentReport,
    error,
    droppedFiles,
    currentScreen,
    firstDrawer,
    secondDrawer
  });
