#!/usr/bin/env node

// Local Verification Test Script
// Tests all new SaaS features before deployment

const http = require('http');

console.log('🧪 Running Local Verification Tests...\n');

const tests = [];
let passed = 0;
let failed = 0;

// Test configuration
const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

async function testEndpoint(url, name, expectedStatus = 200) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? require('https') : http;
    
    const req = client.get(url, (res) => {
      const success = res.statusCode === expectedStatus;
      console.log(`  ${success ? '✅' : '❌'} ${name} (${res.statusCode})`);
      
      if (success) {
        passed++;
      } else {
        failed++;
      }
      resolve(success);
    });

    req.on('error', (err) => {
      console.log(`  ❌ ${name} - ${err.message}`);
      failed++;
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`  ❌ ${name} - Timeout`);
      failed++;
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🔧 Backend API Tests:');
  await testEndpoint(`${BACKEND_URL}/health`, 'Health Check');
  await testEndpoint(`${BACKEND_URL}/api/auth/profile`, 'Auth Profile', 401); // Should be unauthorized
  
  console.log('\n🌐 Frontend Tests:');
  await testEndpoint(`${FRONTEND_URL}/`, 'Landing Page');
  await testEndpoint(`${FRONTEND_URL}/privacy-policy`, 'Privacy Policy');
  await testEndpoint(`${FRONTEND_URL}/terms-of-service`, 'Terms of Service');
  await testEndpoint(`${FRONTEND_URL}/contact`, 'Contact Page');
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\nManual Verification Checklist:');
    console.log('1. Open http://localhost:5173');
    console.log('2. Check footer has Privacy Policy, Terms, Contact links');
    console.log('3. Click Privacy Policy - page should load');
    console.log('4. Click Terms of Service - page should load');
    console.log('5. Click Contact - form should be visible');
    console.log('6. Check cookie consent banner appears');
    console.log('7. Test signup/login flow');
    console.log('8. Test contact form submission');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed!');
    console.log('Make sure both backend and frontend are running:');
    console.log('  Backend:  npm run dev (in backend folder)');
    console.log('  Frontend: npm run dev (in frontend folder)');
    process.exit(1);
  }
}

// Wait a bit for servers to be ready
setTimeout(runTests, 2000);
