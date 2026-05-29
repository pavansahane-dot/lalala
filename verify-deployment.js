#!/usr/bin/env node

// Pre-Deployment Verification Script
// Checks if all required components are ready for production

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Pre-Deployment Verification...\n');

const checks = {
  legal: [],
  security: [],
  functionality: [],
  configuration: []
};

// Legal & Compliance Checks
console.log('📋 Legal & Compliance:');
checks.legal.push(checkFile('frontend/src/pages/PrivacyPolicy.tsx', 'Privacy Policy'));
checks.legal.push(checkFile('frontend/src/pages/TermsOfService.tsx', 'Terms of Service'));
checks.legal.push(checkFile('frontend/src/components/CookieConsent.tsx', 'Cookie Consent'));
checks.legal.push(checkFile('frontend/src/pages/Contact.tsx', 'Contact Page'));

// Security Checks
console.log('\n🔒 Security:');
checks.security.push(checkFile('backend/middleware/auth.js', 'Auth Middleware'));
checks.security.push(checkFile('backend/middleware/networkGuard.js', 'Rate Limiting'));
checks.security.push(checkEnvVar('JWT_SECRET', 'JWT Secret'));
checks.security.push(checkEnvVar('JWT_REFRESH_SECRET', 'JWT Refresh Secret'));

// Functionality Checks
console.log('\n⚙️  Functionality:');
checks.functionality.push(checkFile('backend/routes/auth.js', 'Auth Routes'));
checks.functionality.push(checkFile('backend/routes/billing.js', 'Billing Routes'));
checks.functionality.push(checkFile('backend/routes/contact.js', 'Contact Routes'));
checks.functionality.push(checkFile('frontend/src/utils/analytics.ts', 'Analytics'));

// Configuration Checks
console.log('\n🔧 Configuration:');
checks.configuration.push(checkFile('backend/Dockerfile', 'Backend Dockerfile'));
checks.configuration.push(checkFile('frontend/Dockerfile', 'Frontend Dockerfile'));
checks.configuration.push(checkFile('azure-deploy.ps1', 'Azure Deploy Script'));
checks.configuration.push(checkFile('.env.azure', 'Azure Environment Template'));
checks.configuration.push(checkFile('frontend/public/sitemap.xml', 'Sitemap'));
checks.configuration.push(checkFile('frontend/public/robots.txt', 'Robots.txt'));

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log('='.repeat(50));

const categories = ['legal', 'security', 'functionality', 'configuration'];
let totalPassed = 0;
let totalChecks = 0;

categories.forEach(category => {
  const passed = checks[category].filter(c => c).length;
  const total = checks[category].length;
  totalPassed += passed;
  totalChecks += total;
  
  const status = passed === total ? '✅' : '⚠️';
  console.log(`${status} ${category.toUpperCase()}: ${passed}/${total} passed`);
});

console.log('='.repeat(50));

if (totalPassed === totalChecks) {
  console.log('✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT!');
  console.log('\nNext steps:');
  console.log('1. Run: az login');
  console.log('2. Run: .\\azure-deploy.ps1');
  console.log('3. Configure production environment variables');
  process.exit(0);
} else {
  console.log(`⚠️  ${totalChecks - totalPassed} checks failed - Review issues above`);
  process.exit(1);
}

// Helper Functions
function checkFile(filePath, name) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${name}`);
  return exists;
}

function checkEnvVar(varName, description) {
  // Check if variable is documented in .env.azure
  const envPath = path.join(__dirname, '.env.azure');
  if (!fs.existsSync(envPath)) {
    console.log(`  ❌ ${description} (no .env.azure found)`);
    return false;
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const exists = content.includes(varName);
  console.log(`  ${exists ? '✅' : '❌'} ${description}`);
  return exists;
}
