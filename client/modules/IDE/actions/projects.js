import apiClient from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from './loader';

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
    apiClient
      .get(url)
      .then((response) => {
        dispatch({
          type: ActionTypes.SET_PROJECTS,
          projects: response.data
        });
        dispatch(stopLoader());
      })
      .catch((error) => {
        const { response } = error;
        dispatch({
          type: ActionTypes.ERROR,
          error: response.data
        });
        dispatch(stopLoader());
      });
  };
}
