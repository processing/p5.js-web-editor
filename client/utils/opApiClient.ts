import axios, { AxiosInstance } from 'axios';
import { getConfig } from './getConfig';

function createOpClientInstance(): AxiosInstance {
  return axios.create({
    baseURL: getConfig('API_URL'),
    headers: {
      Authorization: `Bearer ${getConfig('API_TOKEN')}`
    }
  });
}

export const opApiClient = createOpClientInstance();
