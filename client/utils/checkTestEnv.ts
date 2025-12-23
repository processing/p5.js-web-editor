import { getEnvVar } from './getConfig';

export const isTestEnvironment = getEnvVar('NODE_ENV') === 'test';
