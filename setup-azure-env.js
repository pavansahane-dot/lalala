#!/usr/bin/env node

// Azure Environment Setup and Validation Script

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔧 Azure Environment Setup\n');

// Generate secure secrets
function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envAzurePath = path.join(__dirname, '.env.azure');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Creating from template...\n');
  
  if (fs.existsSync(envAzurePath)) {
    fs.copyFileSync(envAzurePath, envPath);
    console.log('✅ Created .env from .env.azure template\n');
  } else {
    console.error('❌ .env.azure template not found!');
    process.exit(1);
  }
}

// Generate secrets
console.log('🔐 Generated Secrets (add these to your .env file):\n');
console.log(`JWT_SECRET=${generateSecret()}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret()}\n`);

// Validation checklist
console.log('📋 Environment Variables Checklist:\n');

const requiredVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'NODE_ENV'
];

const optionalVars = [
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'TWILIO_ACCOUNT_SID',
  'STRIPE_SECRET_KEY',
  'GOOGLE_CLIENT_ID'
];

console.log('Required:');
requiredVars.forEach(v => console.log(`  [ ] ${v}`));

console.log('\nOptional (for full features):');
optionalVars.forEach(v => console.log(`  [ ] ${v}`));

console.log('\n💡 Next Steps:');
console.log('1. Edit .env file with your Azure resource values');
console.log('2. Run: az login');
console.log('3. Run: .\\azure-deploy.ps1 (Windows) or ./azure-deploy.sh (Linux/Mac)');
console.log('4. After deployment, run database migrations');
