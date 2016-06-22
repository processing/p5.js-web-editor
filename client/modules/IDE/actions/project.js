import * as ActionTypes from '../../../constants';
import { browserHistory } from 'react-router'
import axios from 'axios'

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function getProject(id) {
	return function(dispatch) {
		axios.get(`${ROOT_URL}/projects/${id}`, {withCredentials: true})
			.then(response => {
				browserHistory.push(`/projects/${id}`);
				dispatch({
					type: ActionTypes.SET_PROJECT_NAME,
					project: response.data
				})
			})
			.catch(response => dispatch({
				type: ActionTypes.ERROR
			}));
	}
}

export function setProjectName(event) {
	var name = event.target.textContent;
	return {
		type: ActionTypes.SET_PROJECT_NAME,
		name: name
	}
}

export function saveProject() {
	return function(dispatch, getState) {
		var state = getState();
		var formParams = Object.assign({}, state.project);
		formParams.file = state.file;
		debugger;
		if (state.id) {
			axios.put(`${ROOT_URL}/projects/${state.id}`, formParams, {withCredentials: true})
				.then(response => {
					dispatch({
						type: ActionTypes.PROJECT_SAVE_SUCCESS
					})
					.catch(response => dispatch({
						type: ActionTypes.PROJECT_SAVE_FAIL
					}));
				})
		}
		else {
			axios.post(`${ROOT_URL}/projects`, formParams, {withCredentials: true})
				.then(response => {
					browserHistory.push('/projects/' + response.data.id);
					dispatch({
						type: ActionTypes.NEW_PROJECT,
						name: response.data.name,
						id: response.data.id,
						file: {
							name: response.data.file.name,
							content: response.data.file.content
						}
					});
				})
				.catch(response => dispatch({
					type: ActionTypes.PROJECT_SAVE_FAIL
				}));
		}
	}
}


export function createProject() {
	return function(dispatch) {
		axios.post(`${ROOT_URL}/projects`, {}, {withCredentials: true})
			.then(response => {
				browserHistory.push('/projects/' + response.data.id);
				dispatch({
					type: ActionTypes.NEW_PROJECT,
					name: response.data.name,
					id: response.data.id,
					file: {
						name: response.data.file.name,
						content: response.data.file.content
					}
				});
			})
			.catch(response => dispatch({
				type: ActionTypes.PROJECT_SAVE_FAIL
			}));
	}
}