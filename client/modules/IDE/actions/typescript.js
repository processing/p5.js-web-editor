/* eslint-disable import/prefer-default-export */
// actionTypes/typescript.js

import { TOGGLE_TYPESCRIPT, CREATE_TYPESCRIPT_FILE } from '../../../constants';

export const toggleTypeScript = () => ({
  type: TOGGLE_TYPESCRIPT
});

export const createTypeScriptFile = () => ({
  type: CREATE_TYPESCRIPT_FILE
});
