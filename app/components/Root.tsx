import React from 'react';
import { Provider } from 'react-redux';
import { hot } from 'react-hot-loader/root';

import { Store } from '../state/types';

import App from './App';

type Props = {
  store: Store;
};

const Root = ({ store }: Props) => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default hot(Root);
