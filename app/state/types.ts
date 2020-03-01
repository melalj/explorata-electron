import { Dispatch as ReduxDispatch, Store as ReduxStore, Action } from 'redux';

export type stateType = {
  isLoading: boolean;
  currentScreen: string;
  currentReport: string;
  error: string;
  droppedFiles: Array;
};

export type GetState = () => stateType;

export type Dispatch = ReduxDispatch<Action<string>>;

export type Store = ReduxStore<stateType, Action<string>>;
