# Upload Backgrounds to AWS S3/CloudFront CDN
# Run this script to upload all background images to your CDN for faster loading

param(
    [string]$BucketName = "your-s3-bucket-name",
    [string]$CloudFrontDomain = "d27paqapg0ahqm.cloudfront.net",
    [string]$LocalPath = ".\public\svg\background",
    [string]$S3Prefix = "backgrounds"
)

Write-Host "🚀 Background CDN Upload Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if AWS CLI is installed
$awsInstalled = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsInstalled) {
    Write-Host "❌ AWS CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   winget install Amazon.AWSCLI" -ForegroundColor Yellow
    Write-Host "   Or download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check if local path exists
if (-not (Test-Path $LocalPath)) {
    Write-Host "❌ Local path not found: $LocalPath" -ForegroundColor Red
    exit 1
}

# Count files to upload
$files = Get-ChildItem -Path $LocalPath -File -Recurse -Include "*.png","*.jpg","*.jpeg","*.webp","*.svg"
Write-Host "`n📁 Found $($files.Count) background images to upload" -ForegroundColor Green

# Confirm upload
$confirm = Read-Host "`nDo you want to upload to s3://$BucketName/$S3Prefix/? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Upload cancelled." -ForegroundColor Yellow
    exit 0
}

# Upload files
Write-Host "`n⬆️  Uploading files..." -ForegroundColor Cyan

foreach ($file in $files) {
    $relativePath = $file.Name
    $s3Key = "$S3Prefix/$relativePath"
    
    Write-Host "  Uploading: $relativePath" -ForegroundColor Gray
    
    # Determine content type
    $contentType = switch ($file.Extension.ToLower()) {
        ".png" { "image/png" }
        ".jpg" { "image/jpeg" }
        ".jpeg" { "image/jpeg" }
        ".webp" { "image/webp" }
        ".svg" { "image/svg+xml" }
        default { "application/octet-stream" }
    }
    
    # Upload to S3 with public-read ACL and cache headers
    aws s3 cp $file.FullName "s3://$BucketName/$s3Key" `
        --content-type $contentType `
        --cache-control "public, max-age=31536000" `
        --metadata-directive REPLACE
}

Write-Host "`n✅ Upload complete!" -ForegroundColor Green
Write-Host "`n📍 Your backgrounds are now available at:" -ForegroundColor Cyan
Write-Host "   https://$CloudFrontDomain/$S3Prefix/<filename>" -ForegroundColor Yellow

Write-Host "`n💡 Example URLs:" -ForegroundColor Cyan
foreach ($file in ($files | Select-Object -First 3)) {
    Write-Host "   https://$CloudFrontDomain/$S3Prefix/$($file.Name)" -ForegroundColor Gray
}

Write-Host "`n🔧 To invalidate CloudFront cache (if updating existing files):" -ForegroundColor Cyan
Write-Host "   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/$S3Prefix/*'" -ForegroundColor Yellow
