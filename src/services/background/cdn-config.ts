/**
 * CDN Configuration for Background Images
 * 
 * Provides CloudFront CDN URLs for faster background image loading.
 * Configure your CDN domain here for global edge caching.
 */

// Your CloudFront distribution domain
export const CDN_DOMAIN = 'd27paqapg0ahqm.cloudfront.net'

// Base URL for CDN-hosted backgrounds
export const CDN_BASE_URL = `https://${CDN_DOMAIN}`

// Path prefix for backgrounds on CDN
export const CDN_BACKGROUNDS_PATH = 'backgrounds'

/**
 * Convert a local background path to CDN URL
 * @param localPath - Local path like '/svg/background/image.png'
 * @returns CDN URL or original path if not mappable
 */
export function toCdnUrl(localPath: string): string {
  if (!localPath) return localPath
  
  // Already a full URL (remote or CDN)
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath
  }
  
  // Data URL - return as-is
  if (localPath.startsWith('data:')) {
    return localPath
  }
  
  // Local bundled background - convert to CDN
  // e.g., /svg/background/image.png -> https://d27paqapg0ahqm.cloudfront.net/backgrounds/image.png
  if (localPath.includes('/svg/background/')) {
    const filename = localPath.split('/').pop()
    if (filename) {
      return `${CDN_BASE_URL}/${CDN_BACKGROUNDS_PATH}/${encodeURIComponent(filename)}`
    }
  }
  
  // Return original if no CDN mapping available
  return localPath
}

/**
 * Check if CDN is enabled
 * Set to false to disable CDN and use local files
 * Set to true once you've uploaded backgrounds to CloudFront
 */
export const CDN_ENABLED = false  // Set to true after uploading to CloudFront

/**
 * Get the appropriate URL for a background
 * Uses CDN when enabled, falls back to local otherwise
 */
export function resolveBackgroundUrl(localPath: string, useCdn = CDN_ENABLED): string {
  if (!useCdn) return localPath
  return toCdnUrl(localPath)
}

/**
 * Instructions for uploading backgrounds to CDN:
 * 
 * 1. Upload to S3 bucket:
 *    aws s3 cp ./public/svg/background/ s3://your-bucket/backgrounds/ --recursive
 * 
 * 2. Or use the existing upload script:
 *    node scripts/upload-svgs-to-s3.cjs
 * 
 * 3. Ensure CloudFront distribution is configured to serve from your S3 bucket
 * 
 * 4. Files will be available at:
 *    https://d27paqapg0ahqm.cloudfront.net/backgrounds/filename.png
 */
