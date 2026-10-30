require('@babel/register');
require('regenerator-runtime/runtime');
const path = require('path');
/**
 * ⚠️ INTENTIONAL EXCEPTION — loads .env.production directly, not loadEnv.js:
 * this hand-run script migrates the PRODUCTION database. In the future,
 * loadEnv might grow to accommodate a production overlay.
 */
require('dotenv').config({ path: path.resolve('.env.production') });
require('./emailConsolidation');
// require('./populateTotalSize');
// require('./moveBucket');
// require('./truncate');
