#!/usr/bin/env node

/**
 * Firebase Setup Helper Script
 * This script helps you set up Firebase configuration
 * 
 * Usage: node setup-firebase.cjs
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('\n🔥 Firebase Setup Helper\n');
  console.log('Please provide your Firebase configuration values.');
  console.log('You can find these in Firebase Console > Project Settings > Your apps > Web app\n');

  const apiKey = await question('API Key: ');
  const authDomain = await question('Auth Domain: ');
  const projectId = await question('Project ID: ');
  const storageBucket = await question('Storage Bucket: ');
  const messagingSenderId = await question('Messaging Sender ID: ');
  const appId = await question('App ID: ');
  const measurementId = await question('Measurement ID (optional, press Enter to skip): ');

  const envContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain}
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
VITE_FIREBASE_APP_ID=${appId}
${measurementId ? `VITE_FIREBASE_MEASUREMENT_ID=${measurementId}` : '# VITE_FIREBASE_MEASUREMENT_ID='}

# Gemini AI Configuration (Optional)
# VITE_GEMINI_API_KEY=your-gemini-api-key
`;

  const envPath = path.join(process.cwd(), '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: firebase init');
    console.log('2. Select your project and configure Firestore + Hosting');
    console.log('3. Run: firebase deploy --only firestore:rules');
    console.log('4. Run: npm run dev');
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message);
  }

  rl.close();
}

setup();

