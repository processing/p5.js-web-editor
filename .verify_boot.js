process.env.NODE_ENV='test'; process.env.PORT='0'; process.env.PREVIEW_PORT='0';
process.env.API_URL='https://example.org/api'; process.env.EDITOR_URL='http://localhost:8000';
require('@babel/register')({extensions:['.js','.jsx','.ts','.tsx'],presets:['@babel/preset-env','@babel/preset-typescript']});
require('regenerator-runtime/runtime');
try { require('./server/server.js'); require('./server/previewServer.js'); console.log('OK: both servers boot'); }
catch(e){ console.error('BOOT ERROR:', e.message); process.exit(1); }
