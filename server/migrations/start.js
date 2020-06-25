require('@babel/register');
require('@babel/polyfill');
const path = require('path');
require('dotenv').config({ path: path.resolve('.env') });
require('./populateTotalSize');
// require('./moveBucket');
// require('./truncate');
