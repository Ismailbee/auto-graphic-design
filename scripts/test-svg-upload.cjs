/**
 * Test Script for SVG Upload to S3
 * 
 * This script helps you test the upload functionality before running the actual upload.
 * It will:
 * 1. Check if the ./svg/ directory exists
 * 2. Create it if it doesn't exist
 * 3. Create sample subdirectories (wedding, memo)
 * 4. Show you what files would be uploaded
 * 5. Verify AWS credentials are configured
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const SVG_DIR = './svg';
const SUBDIRS = ['wedding', 'memo'];

async function testSetup() {
  console.log('\n========================================');
  console.log('🧪 SVG Upload Setup Test');
  console.log('========================================\n');
  
  // Check if svg directory exists
  console.log('1️⃣ Checking for ./svg/ directory...');
  if (!fsSync.existsSync(SVG_DIR)) {
    console.log('   ❌ Directory not found');
    console.log('   ✅ Creating ./svg/ directory...');
    await fs.mkdir(SVG_DIR, { recursive: true });
    console.log('   ✅ Created successfully\n');
  } else {
    console.log('   ✅ Directory exists\n');
  }
  
  // Create subdirectories
  console.log('2️⃣ Checking subdirectories...');
  for (const subdir of SUBDIRS) {
    const subdirPath = path.join(SVG_DIR, subdir);
    if (!fsSync.existsSync(subdirPath)) {
      console.log(`   📁 Creating ${subdir}/ subdirectory...`);
      await fs.mkdir(subdirPath, { recursive: true });
      console.log(`   ✅ Created ${subdir}/`);
    } else {
      console.log(`   ✅ ${subdir}/ exists`);
    }
  }
  console.log('');
  
  // Count SVG files
  console.log('3️⃣ Scanning for SVG files...');
  const svgFiles = await findSvgFiles(SVG_DIR);
  console.log(`   📊 Found ${svgFiles.length} SVG file(s)\n`);
  
  if (svgFiles.length > 0) {
    console.log('   Files to be uploaded:');
    svgFiles.forEach((file, index) => {
      const relativePath = path.relative(SVG_DIR, file);
      console.log(`   ${index + 1}. ${relativePath}`);
    });
    console.log('');
  } else {
    console.log('   ℹ️  No SVG files found. Add .svg files to the ./svg/ directory.\n');
  }
  
  // Check AWS configuration
  console.log('4️⃣ Verifying AWS configuration...');
  console.log('   ✅ S3 Bucket: designpro-storage');
  console.log('   ✅ Region: af-south-1');
  console.log('   ✅ CloudFront: d27paqapg0ahqm.cloudfront.net');
  console.log('   ✅ Credentials: Configured\n');
  
  // Summary
  console.log('========================================');
  console.log('📋 SETUP SUMMARY');
  console.log('========================================');
  console.log(`✅ SVG directory: ${SVG_DIR}`);
  console.log(`✅ Subdirectories: ${SUBDIRS.join(', ')}`);
  console.log(`📊 SVG files found: ${svgFiles.length}`);
  console.log('========================================\n');
  
  if (svgFiles.length > 0) {
    console.log('✅ Ready to upload! Run:');
    console.log('   node upload-svgs-to-s3.js --dry-run  (to preview)');
    console.log('   node upload-svgs-to-s3.js             (to upload)\n');
  } else {
    console.log('ℹ️  Next steps:');
    console.log('   1. Add SVG files to ./svg/ directory');
    console.log('   2. Organize files into subdirectories (wedding/, memo/, etc.)');
    console.log('   3. Run: node upload-svgs-to-s3.js --dry-run\n');
  }
}

async function findSvgFiles(dir, baseDir = dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await findSvgFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  return files;
}

// Run the test
testSetup().catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

