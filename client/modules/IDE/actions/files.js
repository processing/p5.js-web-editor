import * as ActionTypes from '../../../constants';
import axios from 'axios';

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function updateFileContent(name, content) {
  return {
    type: ActionTypes.UPDATE_FILE_CONTENT,
    name,
    content
  };
}

export function createFile(formProps) {
  return (dispatch, getState) => {
    const state = getState();
    if (state.project.id) {
      const postParams = {
        name: formProps.name
      };
      axios.post(`${ROOT_URL}/projects/${state.project.id}/files`, postParams, { withCredentials: true })
        .then(response => {
          dispatch({
            type: ActionTypes.CREATE_FILE,
            ...response.data
          });
        })
        .catch(response => dispatch({
          type: ActionTypes.ERROR,
          error: response.data
        }));
    } else {
      let maxFileId = 0;
      state.files.forEach(file => {
        if (parseInt(file.id, 10) > maxFileId) {
          maxFileId = parseInt(file.id, 10);
        }
      });
      dispatch({
        type: ActionTypes.CREATE_FILE,
        name: formProps.name,
        id: `${maxFileId + 1}`
      });
      dispatch({
        type: ActionTypes.HIDE_MODAL
      });
    }
  };
}
