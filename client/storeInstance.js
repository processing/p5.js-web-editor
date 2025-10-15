import setupStore from './store';

const initialState = window.__INITIAL_STATE__;
const store = setupStore(initialState);

export default store;
