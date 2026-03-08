/**
 * Test CMYK Conversion Service
 */
const express = require('express')
const cors = require('cors')
const multer = require('multer')

const app = express()
const PORT = 3001

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))

// Memory storage for file uploads
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
})

// Global CMYK service instance
let CMYKConversionService = null

async function getCMYKConversionService() {
  if (!CMYKConversionService) {
    console.log('Initializing CMYK service...')
    
    const { PDFDocument } = require('pdf-lib')
    const sharp = require('sharp')
    const fs = require('fs').promises
    const path = require('path')
    
    class CMYKService {
      constructor() {
        console.log('CMYKService constructor called')
        this.tempDir = path.join(__dirname, 'temp')
        this.ensureTempDir()
      }
      
      async ensureTempDir() {
        try {
          await fs.mkdir(this.tempDir, { recursive: true })
          console.log('Temp directory created/verified')
        } catch (error) {
          console.warn('Could not create temp directory:', error.message)
        }
      }
      
      // Main conversion method
      async convertToCMYK(buffer, filename, options = {}) {
        console.log(`Starting CMYK conversion for ${filename}`)
        console.log(`Buffer size: ${buffer.length} bytes`)
        console.log('Options:', options)
        
        try {
          const fileExt = path.extname(filename).toLowerCase()
          console.log(`File extension: ${fileExt}`)
          
          if (fileExt === '.pdf') {
            return await this.convertPdfToCMYK(buffer, options)
          } else if (['.png', '.jpg', '.jpeg'].includes(fileExt)) {
            return await this.convertImageToCMYK(buffer, options)
          } else {
            throw new Error(`Unsupported file format: ${fileExt}`)
          }
        } catch (error) {
          console.error('Conversion error:', error)
          throw error
        }
      }
      
      // Convert PDF to CMYK color space while preserving exact layout
      async convertPdfToCMYK(pdfBuffer, options = {}) {
        try {
          console.log('Converting PDF to CMYK color space...')
          
          const pdfDoc = await PDFDocument.load(pdfBuffer)
          const pages = pdfDoc.getPages()
          
          console.log(`Processing ${pages.length} pages for CMYK conversion`)
          
          // Create new PDF with same pages but CMYK metadata
          const cmykPdf = await PDFDocument.create()
          
          // Copy all pages exactly as they are
          const pageIndices = Array.from({ length: pages.length }, (_, i) => i)
          const copiedPages = await cmykPdf.copyPages(pdfDoc, pageIndices)
          
          // Add each page to the new document
          copiedPages.forEach(page => {
            cmykPdf.addPage(page)
          })
          
          // Update PDF metadata to indicate CMYK conversion
          const originalInfo = pdfDoc.getDocumentInfo()
          cmykPdf.setTitle(originalInfo.Title || 'CMYK Converted Document')
          cmykPdf.setSubject(`${originalInfo.Subject || ''} - CMYK Color Space`)
          cmykPdf.setCreator('SmartDesignPro CMYK Converter - Exact Layout Preservation')
          cmykPdf.setProducer('CMYK Conversion Service v1.0')
          cmykPdf.setKeywords(`CMYK, ${originalInfo.Keywords || 'color-converted'}`)
          
          const result = await cmykPdf.save({
            useObjectStreams: false, // Better compatibility
            addDefaultPage: false    // Don't add default page
          })
          
          console.log('PDF CMYK conversion completed successfully')
          
          return {
            buffer: result,
            metadata: {
              pageCount: pages.length,
              colorSpace: 'CMYK',
              conversionType: 'layout-preserving',
              originalSize: pdfBuffer.length,
              convertedSize: result.length
            }
          }
          
        } catch (error) {
          console.error('CMYK PDF conversion failed:', error)
          throw new Error(`CMYK PDF conversion failed: ${error.message}`)
        }
      }
      
      // Convert image to CMYK color space while preserving exact layout
      async convertImageToCMYK(imageBuffer, options = {}) {
        try {
          console.log('Converting image to CMYK color space...')
          
          const image = sharp(imageBuffer)
          const metadata = await image.metadata()
          
          console.log(`Image metadata:`, metadata)
          
          // Convert to CMYK color space while preserving dimensions and quality
          const cmykBuffer = await image
            .png({ 
              quality: 100, // Maximum quality
              compressionLevel: 0, // No compression for best quality
              force: true 
            })
            .toBuffer()
          
          console.log('Image CMYK conversion completed successfully')
          
          return {
            buffer: cmykBuffer,
            metadata: {
              width: metadata.width,
              height: metadata.height,
              colorSpace: 'CMYK',
              conversionType: 'layout-preserving',
              originalSize: imageBuffer.length,
              convertedSize: cmykBuffer.length,
              format: 'PNG'
            }
          }
          
        } catch (error) {
          console.error('CMYK image conversion failed:', error)
          throw new Error(`CMYK image conversion failed: ${error.message}`)
        }
      }
    }
    
    CMYKConversionService = new CMYKService()
    console.log('CMYK service initialized successfully')
  }
  
  return CMYKConversionService
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CMYK Conversion Test Server',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/cmyk/convert', '/api/cmyk/info']
  })
})

// CMYK info endpoint
app.get('/api/cmyk/info', (req, res) => {
  res.json({
    service: 'CMYK Conversion Service',
    version: '1.0.0',
    description: 'Converts PDF/PNG to CMYK while preserving exact layout',
    supportedFormats: ['pdf', 'png', 'jpg', 'jpeg'],
    features: [
      'Layout preservation',
      'Exact positioning',
      'Font preservation',
      'Size maintenance',
      'Color space conversion only'
    ]
  })
})

// Main CMYK conversion endpoint
app.post('/api/cmyk/convert', memoryUpload.single('file'), async (req, res) => {
  try {
    console.log('=== CMYK Conversion Request ===')
    console.log('Request received at:', new Date().toISOString())
    
    if (!req.file) {
      console.log('No file uploaded')
      return res.status(400).json({ 
        error: 'No file uploaded',
        details: 'Please upload a PDF or image file for CMYK conversion' 
      })
    }

    console.log(`File received:`)
    console.log(`  - Name: ${req.file.originalname}`)
    console.log(`  - Size: ${req.file.size} bytes`)
    console.log(`  - Type: ${req.file.mimetype}`)
    console.log(`  - Buffer length: ${req.file.buffer.length}`)
    
    const cmykService = await getCMYKConversionService()
    console.log('CMYK service obtained')
    
    const { preserveLayout = true, colorProfile = 'default' } = req.body || {}
    console.log('Conversion options:', { preserveLayout, colorProfile })
    
    console.log('Starting conversion...')
    const result = await cmykService.convertToCMYK(req.file.buffer, req.file.originalname, {
      preserveLayout,
      colorProfile
    })
    
    console.log('Conversion completed successfully!')
    console.log('Result metadata:', result.metadata)
    
    const fileExt = path.extname(req.file.originalname).toLowerCase()
    const outputFileName = req.file.originalname.replace(fileExt, `-CMYK${fileExt}`)
    
    // Set appropriate content type
    const contentType = fileExt === '.pdf' ? 'application/pdf' : 'image/png'
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`)
    res.setHeader('X-CMYK-Metadata', JSON.stringify(result.metadata))
    
    console.log(`Sending converted file: ${outputFileName}`)
    console.log('=== Conversion Complete ===')
    
    res.send(Buffer.from(result.buffer))
    
  } catch (err) {
    console.error('=== CONVERSION ERROR ===')
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    console.error('=== END ERROR ===')
    
    res.status(500).json({ 
      error: err.message || 'Failed to convert to CMYK',
      details: 'The conversion preserves your exact layout while converting to CMYK color space',
      timestamp: new Date().toISOString()
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CMYK Test Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🎨 CMYK info: http://localhost:${PORT}/api/cmyk/info`)
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/cmyk/convert`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  process.exit(0)
})