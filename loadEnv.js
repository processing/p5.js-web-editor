const path = require('path');
const dotenv = require('dotenv');

/**
 * Loads .env — and, when APP_ENV=e2e, .env.e2e first so its values win
 * (dotenv v2 never overwrites already-set vars; re-check if upgrading dotenv).
 * Both files are optional; paths resolve relative to this file.
 */
module.exports = function loadEnv() {
  if (process.env.APP_ENV === 'e2e') {
    dotenv.config({ path: path.resolve(__dirname, '.env.e2e'), silent: true });
  }
  dotenv.config({ path: path.resolve(__dirname, '.env'), silent: true });
};
