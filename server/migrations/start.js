require('@babel/register');
require('regenerator-runtime/runtime');
const path = require('path');
require('dotenv').config({ path: path.resolve('.env.production') });
require('./emailConsolidation');
// require('./populateTotalSize');
// require('./moveBucket');
// require('./truncate');
