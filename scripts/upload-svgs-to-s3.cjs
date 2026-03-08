/**
 * ========================================
 * SVG to AWS S3/CloudFront Upload Script
 * ========================================
 * 
 * This script uploads SVG files from a local directory to AWS S3 and generates
 * CloudFront URLs for accessing the files.
 * 
 * REQUIRED DEPENDENCIES:
 * - @aws-sdk/client-s3 (AWS SDK v3 for S3 operations)
 * - chokidar (for watch mode)
 * 
 * INSTALLATION:
 * npm install @aws-sdk/client-s3 chokidar
 * 
 * USAGE:
 * node upload-svgs-to-s3.cjs              # Upload all SVG files
 * node upload-svgs-to-s3.cjs --dry-run    # Show what would be uploaded without uploading
 * node upload-svgs-to-s3.cjs --watch      # Upload and watch for changes
 * node upload-svgs-to-s3.cjs -w           # Short form of --watch
 * 
 * FEATURES:
 * - Recursively scans ./svg/ directory for all .svg files
 * - Preserves folder structure in S3
 * - Sets proper Content-Type (image/svg+xml)
 * - Makes files publicly accessible via CloudFront
 * - Generates JSON mapping of local paths to CloudFront URLs
 * - Optional watch mode for automatic uploads on file changes
 * - Dry-run mode to preview uploads
 * 
 * ========================================
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// ========================================
// AWS CONFIGURATION
// ========================================
const AWS_CONFIG = {
  bucketName: 'designpro-storage',
  region: 'af-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  cloudfrontDomain: 'd27paqapg0ahqm.cloudfront.net'
};

// ========================================
// LOCAL CONFIGURATION
// ========================================
const LOCAL_CONFIG = {
  sourceDirectory: './public/svg',
  outputJsonFile: 'cloudfront-urls.json'
};

// ========================================
// INITIALIZE AWS S3 CLIENT
// ========================================
const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey
  }
});

// ========================================
// GLOBAL STATE
// ========================================
let uploadedFiles = {};
let totalUploaded = 0;
let totalErrors = 0;
let isDryRun = false;
let isWatchMode = false;

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  isDryRun = args.includes('--dry-run');
  isWatchMode = args.includes('--watch') || args.includes('-w');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be uploaded\n');
  }
  if (isWatchMode) {
    console.log('👀 WATCH MODE - Monitoring for file changes\n');
  }
}

/**
 * Recursively find all SVG files in a directory
 * @param {string} dir - Directory to search
 * @param {string} baseDir - Base directory for relative path calculation
 * @returns {Promise<string[]>} Array of file paths
 */
async function findSvgFiles(dir, baseDir = dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await findSvgFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Get S3 key from local file path (preserves folder structure)
 * @param {string} filePath - Local file path
 * @returns {string} S3 key
 */
function getS3Key(filePath) {
  // Remove the ./svg/ prefix and normalize path separators
  const relativePath = path.relative(LOCAL_CONFIG.sourceDirectory, filePath);
  // Convert Windows backslashes to forward slashes for S3
  return relativePath.replace(/\\/g, '/');
}

/**
 * Get CloudFront URL for a file
 * @param {string} s3Key - S3 object key
 * @returns {string} CloudFront URL
 */
function getCloudfrontUrl(s3Key) {
  return `https://${AWS_CONFIG.cloudfrontDomain}/${s3Key}`;
}

/**
 * Upload a single file to S3
 * @param {string} filePath - Local file path
 * @returns {Promise<boolean>} Success status
 */
async function uploadFile(filePath) {
  const s3Key = getS3Key(filePath);
  const cloudfrontUrl = getCloudfrontUrl(s3Key);
  
  try {
    console.log(`📤 Uploading: ${s3Key}...`);
    
    if (isDryRun) {
      console.log(`   ✓ Would upload to: ${cloudfrontUrl}`);
      uploadedFiles[filePath] = cloudfrontUrl;
      totalUploaded++;
      return true;
    }
    
    // Read file content
    const fileContent = await fs.readFile(filePath);
    
    // Prepare S3 upload parameters
    const uploadParams = {
      Bucket: AWS_CONFIG.bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'image/svg+xml'
      // ACL removed - bucket uses bucket policy for public access instead
    };
    
    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    console.log(`   ✓ Uploaded successfully: ${cloudfrontUrl}`);
    
    // Store mapping
    uploadedFiles[filePath] = cloudfrontUrl;
    totalUploaded++;
    
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to upload ${s3Key}:`, error.message);
    totalErrors++;
    return false;
  }
}

/**
 * Save CloudFront URLs mapping to JSON file
 */
async function saveUrlMapping() {
  try {
    const jsonContent = JSON.stringify(uploadedFiles, null, 2);
    await fs.writeFile(LOCAL_CONFIG.outputJsonFile, jsonContent, 'utf8');
    console.log(`\n💾 Saved URL mapping to: ${LOCAL_CONFIG.outputJsonFile}`);
  } catch (error) {
    console.error(`❌ Failed to save URL mapping:`, error.message);
  }
}

/**
 * Load existing URL mapping from JSON file
 */
async function loadUrlMapping() {
  try {
    if (fsSync.existsSync(LOCAL_CONFIG.outputJsonFile)) {
      const content = await fs.readFile(LOCAL_CONFIG.outputJsonFile, 'utf8');
      uploadedFiles = JSON.parse(content);
      console.log(`📂 Loaded existing URL mapping (${Object.keys(uploadedFiles).length} files)\n`);
    }
  } catch (error) {
    console.log(`ℹ️  No existing URL mapping found, starting fresh\n`);
  }
}

/**
 * Display upload summary
 */
function displaySummary() {
  console.log('\n========================================');
  console.log('📊 UPLOAD SUMMARY');
  console.log('========================================');
  console.log(`✅ Total files uploaded: ${totalUploaded}`);
  console.log(`❌ Total errors: ${totalErrors}`);
  console.log(`📁 Total files in mapping: ${Object.keys(uploadedFiles).length}`);
  console.log('========================================\n');
}

/**
 * Upload all SVG files from the source directory
 */
async function uploadAllFiles() {
  console.log('🔍 Scanning for SVG files...\n');
  
  // Check if source directory exists
  if (!fsSync.existsSync(LOCAL_CONFIG.sourceDirectory)) {
    console.error(`❌ Source directory not found: ${LOCAL_CONFIG.sourceDirectory}`);
    console.log(`ℹ️  Please create the directory and add SVG files to upload.`);
    return;
  }
  
  // Find all SVG files
  const svgFiles = await findSvgFiles(LOCAL_CONFIG.sourceDirectory);
  
  if (svgFiles.length === 0) {
    console.log(`ℹ️  No SVG files found in ${LOCAL_CONFIG.sourceDirectory}`);
    return;
  }
  
  console.log(`📋 Found ${svgFiles.length} SVG file(s)\n`);
  
  // Upload each file
  for (const filePath of svgFiles) {
    await uploadFile(filePath);
  }
  
  // Save URL mapping
  if (!isDryRun) {
    await saveUrlMapping();
  }
  
  // Display summary
  displaySummary();
}

/**
 * Start watch mode to monitor file changes
 */
function startWatchMode() {
  console.log(`👀 Watching ${LOCAL_CONFIG.sourceDirectory} for changes...\n`);
  
  const watcher = chokidar.watch(`${LOCAL_CONFIG.sourceDirectory}/**/*.svg`, {
    persistent: true,
    ignoreInitial: true
  });
  
  watcher
    .on('add', async (filePath) => {
      console.log(`\n🆕 New file detected: ${filePath}`);
      await uploadFile(filePath);
      await saveUrlMapping();
    })
    .on('change', async (filePath) => {
      console.log(`\n🔄 File modified: ${filePath}`);
      await uploadFile(filePath);
      await saveUrlMapping();
    })
    .on('error', (error) => {
      console.error(`❌ Watcher error:`, error);
    });
  
  console.log('✅ Watch mode active. Press Ctrl+C to stop.\n');
}

// ========================================
// MAIN EXECUTION
// ========================================

/**
 * Main function
 */
async function main() {
  console.log('\n========================================');
  console.log('🚀 SVG to S3/CloudFront Upload Script');
  console.log('========================================\n');
  
  // Parse command line arguments
  parseArguments();
  
  // Load existing URL mapping
  await loadUrlMapping();
  
  // Upload all files
  await uploadAllFiles();
  
  // Start watch mode if requested
  if (isWatchMode && !isDryRun) {
    startWatchMode();
  } else {
    console.log('✅ Upload complete!\n');
  }
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

