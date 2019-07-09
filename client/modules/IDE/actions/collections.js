import axios from 'axios';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from './loader';

const __process = (typeof global !== 'undefined' ? global : window).process;
const ROOT_URL = __process.env.API_URL;

// eslint-disable-next-line
export function getCollections(username) {
  return (dispatch) => {
    dispatch(startLoader());
    let url;
    if (username) {
      url = `${ROOT_URL}/${username}/collections`;
    } else {
      url = `${ROOT_URL}/collections`;
    }
    axios.get(url, { withCredentials: true })
      .then((response) => {
        dispatch({
          type: ActionTypes.SET_COLLECTIONS,
          collections: response.data
        });
        dispatch(stopLoader());
      })
      .catch((response) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: response.data
        });
        dispatch(stopLoader());
      });
  };
}
