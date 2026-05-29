#!/usr/bin/env node

// Health Check Script for Azure Deployment
// Run this after deployment to verify all services

const https = require('https');
const http = require('http');

const checks = {
  webapp: process.env.WEBAPP_URL || 'https://vpn-app-web.azurewebsites.net',
  api: process.env.API_URL || 'https://vpn-app-web.azurewebsites.net/health'
};

console.log('🏥 Running Health Checks...\n');

function checkEndpoint(url, name) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${name}: OK (${res.statusCode})`);
        resolve(true);
      } else {
        console.log(`⚠️  ${name}: Warning (${res.statusCode})`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}: Failed - ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`❌ ${name}: Timeout`);
      resolve(false);
    });
  });
}

async function runChecks() {
  const results = [];
  
  results.push(await checkEndpoint(checks.webapp, 'Web App'));
  results.push(await checkEndpoint(checks.api, 'API Health'));
  
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log(`✅ All checks passed (${passed}/${total})`);
    process.exit(0);
  } else {
    console.log(`⚠️  Some checks failed (${passed}/${total})`);
    process.exit(1);
  }
}

runChecks();
