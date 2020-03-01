import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createRootReducer from '../reducers';
import { Store, stateType } from '../types';

const rootReducer = createRootReducer();
const enhancer = applyMiddleware(thunk);

function configureStore(initialState?: stateType): Store {
  return createStore(rootReducer, initialState, enhancer);
}

export default configureStore;
