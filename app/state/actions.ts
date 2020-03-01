/* eslint-disable no-console */
export const SET_LOADING = 'SET_LOADING';
export function setLoading(isLoading) {
  return {
    type: SET_LOADING,
    isLoading
  };
}

export const SET_CURRENT_REPORT = 'SET_CURRENT_REPORT';
export function setCurrentReport(currentReport) {
  return {
    type: SET_CURRENT_REPORT,
    currentReport
  };
}

export const SET_CURRENT_SCREEN = 'SET_CURRENT_SCREEN';
export function setCurrentScreen(currentScreen) {
  return {
    type: SET_CURRENT_SCREEN,
    currentScreen
  };
}

export const SET_DROPPED_FILES = 'SET_DROPPED_FILES';
export function setDroppedFiles(droppedFiles) {
  return {
    type: SET_DROPPED_FILES,
    droppedFiles
  };
}

export const SET_ERROR = 'SET_ERROR';
export function setError(err) {
  if (err) {
    console.error(
      `[Client Side Error] ${err.message} (${err.stack.replace(/\n/g, ', ')})`
    );
  }
  const error = !err
    ? null
    : [err.response ? err.response.status : 500, err.message];
  return {
    type: SET_ERROR,
    error
  };
}

// TODO: isolate in a separate actions (maybe inside /plugins)
// FB_MESSENGER

export const SHOW_FIRST_DRAWER = 'SHOW_FIRST_DRAWER';
export function showFirstDrawer() {
  return {
    type: SHOW_FIRST_DRAWER
  };
}

export const HIDE_FIRST_DRAWER = 'HIDE_FIRST_DRAWER';
export function hideFirstDrawer() {
  return {
    type: HIDE_FIRST_DRAWER
  };
}

export const SET_FIRST_DRAWER = 'SET_FIRST_DRAWER';
export function setFirstDrawer(typeDrawer, filters) {
  return {
    type: SET_FIRST_DRAWER,
    visible: true,
    typeDrawer,
    filters
  };
}

export const SHOW_SECOND_DRAWER = 'SHOW_SECOND_DRAWER';
export function showSecondDrawer() {
  return {
    type: SHOW_SECOND_DRAWER
  };
}

export const HIDE_SECOND_DRAWER = 'HIDE_SECOND_DRAWER';
export function hideSecondDrawer() {
  return {
    type: HIDE_SECOND_DRAWER
  };
}

export const SET_SECOND_DRAWER = 'SET_SECOND_DRAWER';
export function setSecondDrawer(typeDrawer, filters) {
  return {
    type: SET_SECOND_DRAWER,
    visible: true,
    typeDrawer,
    filters
  };
}
