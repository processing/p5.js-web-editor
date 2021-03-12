import * as ActionTypes from '../../../../constants';
import { startLoader, stopLoader } from '../loader';
import { mockProjects } from '../../../../redux_test_stores/test_store';

// eslint-disable-next-line
export function getProjects(username) {
  console.log(`mocked getProjects call with ${username}`);
  return (dispatch) => {
    dispatch(startLoader());
    dispatch({
      type: ActionTypes.SET_PROJECTS,
      projects: mockProjects
    });
    dispatch(stopLoader());
  };
}
