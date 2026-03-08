#!/usr/bin/env node

/**
 * SmartDesignPro AI Setup Script
 * Quick setup for AI-powered text parsing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 SmartDesignPro AI Setup Script');
console.log('===================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env file not found!');
  console.log('Creating .env template...\n');
  
  const envTemplate = `# AI Services Configuration
VITE_HUGGING_FACE_TOKEN=
VITE_OPENAI_API_KEY=
VITE_GOOGLE_CLOUD_API_KEY=
VITE_IBM_WATSON_API_KEY=
VITE_IBM_WATSON_INSTANCE_ID=
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env template created!');
}

// Check current AI configuration
console.log('🔍 Checking AI Configuration Status:');
console.log('====================================');

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const configs = {
    'Hugging Face (FREE)': envContent.includes('VITE_HUGGING_FACE_TOKEN=') && !envContent.match(/VITE_HUGGING_FACE_TOKEN=\s*$/m),
    'OpenAI (PAID)': envContent.includes('VITE_OPENAI_API_KEY=') && !envContent.match(/VITE_OPENAI_API_KEY=\s*$/m),
    'Google Cloud (FREE TIER)': envContent.includes('VITE_GOOGLE_CLOUD_API_KEY=') && !envContent.match(/VITE_GOOGLE_CLOUD_API_KEY=\s*$/m),
    'IBM Watson (FREE TIER)': envContent.includes('VITE_IBM_WATSON_API_KEY=') && !envContent.match(/VITE_IBM_WATSON_API_KEY=\s*$/m)
  };
  
  let hasAnyConfig = false;
  
  for (const [service, configured] of Object.entries(configs)) {
    const status = configured ? '✅ Configured' : '❌ Not configured';
    console.log(`${service}: ${status}`);
    if (configured) hasAnyConfig = true;
  }
  
  console.log('\n📋 Setup Instructions:');
  console.log('======================');
  
  if (!hasAnyConfig) {
    console.log('🎯 RECOMMENDED: Set up Hugging Face (completely free!)');
    console.log('');
    console.log('1. Visit: https://huggingface.co/settings/tokens');
    console.log('2. Create account (free)');
    console.log('3. Click "New token" → Name: "SmartDesignPro" → Permission: "Read"');
    console.log('4. Copy token (starts with hf_...)');
    console.log('5. Add to .env file: VITE_HUGGING_FACE_TOKEN=hf_your_token_here');
    console.log('6. Restart your dev server');
    console.log('');
    console.log('✨ Features you\'ll get:');
    console.log('• Smart organization name detection');
    console.log('• Address extraction without keywords');
    console.log('• Phone number recognition (any format)');
    console.log('• Email and website detection');
    console.log('• Natural language processing');
    console.log('');
  } else {
    console.log('✅ AI services configured! Your Smart Text Parser should work.');
    console.log('');
    console.log('🧪 Test it by:');
    console.log('1. Go to Generate Invoice page');
    console.log('2. Paste natural business text in Smart Text Parser');
    console.log('3. Watch AI extract organization details automatically!');
    console.log('');
  }
  
  console.log('📖 For detailed setup instructions, see: AI_SETUP_GUIDE.md');
  console.log('');
  console.log('🐛 Troubleshooting:');
  console.log('==================');
  console.log('• If AI fails → System automatically falls back to regex parsing');
  console.log('• Check browser console for detailed error messages');
  console.log('• Ensure internet connection for AI API calls');
  console.log('• Rate limits: Hugging Face allows 30 requests/minute');
  
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
}

console.log('\n🚀 Happy coding with AI-powered text parsing!');