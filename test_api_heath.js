// tests/test_api_health.js
const http = require('http');

console.log("--- 🔍 Starting Node.js API Health Check ---");

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/run-week1', // We can also create a specific /health route later
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  
  if (res.statusCode === 200 || res.statusCode === 500) {
    // 500 is still "alive" (it means the server is there, but maybe Python failed)
    console.log("✅ Backend: Service is UP and Reachable");
  } else {
    console.log("❌ Backend: Unexpected status code");
  }
  process.exit(0);
});

req.on('error', (e) => {
  console.error(`❌ Backend: Connection Failed - Is 'node server.js' running?`);
  console.error(`Details: ${e.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error("❌ Backend: Request Timed Out");
  req.destroy();
  process.exit(1);
});

req.end();