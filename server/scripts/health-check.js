const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 8000;
const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const HOST = process.env.HOST || 'localhost';

const checkEndpoints = [
  '/',
  '/health',
  '/editor'
];

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const client = PROTOCOL === 'https' ? https : http;
    const options = {
      hostname: HOST,
      port: PORT,
      path: endpoint,
      method: 'GET',
      timeout: 5000, // 5 second timeout
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          endpoint,
          statusCode: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      reject({
        endpoint,
        error: error.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        endpoint,
        error: 'Request timed out',
        success: false
      });
    });

    req.end();
  });
}

async function runHealthCheck() {
  console.log(`Running health check on ${PROTOCOL}://${HOST}:${PORT}`);
  
  let allChecksSuccessful = true;
  
  try {
    const results = await Promise.all(
      checkEndpoints.map(endpoint => 
        makeRequest(endpoint).catch(error => error)
      )
    );

    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.endpoint} - OK (${result.statusCode})`);
      } else {
        console.error(`❌ ${result.endpoint} - Failed: ${result.error || result.statusCode}`);
        allChecksSuccessful = false;
      }
    });

    if (!allChecksSuccessful) {
      console.error('❌ Health check failed');
      process.exit(1);
    }

    console.log('✅ All health checks passed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

runHealthCheck(); 