import { apiClient } from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader, setError } from '../reducers/loading';

// eslint-disable-next-line
export function getProjects(username) {
  return (dispatch) => {
    dispatch(startLoader());
    let url;
    if (username) {
      url = `/${username}/projects`;
    } else {
      url = '/projects';
    }
    return apiClient
      .get(url)
      .then((response) => {
        dispatch({
          type: ActionTypes.SET_PROJECTS,
          projects: response.data
        });
        dispatch(stopLoader());
      })
      .catch((error) => {
        dispatch(setError(error?.response?.data || 'Failed to load sketches'));
        dispatch({
          type: ActionTypes.ERROR,
          error: error?.response?.data
        });
      });
  };
}
