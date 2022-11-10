import axios from 'axios';

import getConfig from './getConfig';

const ROOT_URL = getConfig('API_URL');

/**
 * Configures an Axios instance with the correct API URL
 */
function createClientInstance() {
  return axios.create({
    baseURL: ROOT_URL,
    withCredentials: true
  });
}

export default createClientInstance();
