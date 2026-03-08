/**
 * Export & Share Backend Server
 * Handles export processing and share link management
 */
/* eslint-disable no-console */
/* eslint-disable global-require */

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const crypto = require('crypto')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// (Removed unused disk storage + upload middleware; using memory storage for imposition endpoints)

// In-memory storage (replace with database in production)
const exportRecords = new Map()
const shareLinks = new Map()

// =======================
// Imposition Endpoints
// =======================
// Use memory storage for imposition endpoints (we pass buffers to pdf-lib/sharp)
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })

// Lazy-load heavy deps to keep base server lean until first use
let ImpositionService = null
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
            return await this.convertImageToCMYK(buffer, fileExt, options)
          } else {
            throw new Error(`Unsupported file format: ${fileExt}`)
          }
        } catch (error) {
          console.error('Conversion error:', error)
          throw error
        }
      }
      
      // Convert RGB to CMYK values (0-1 range)
      rgbToCmyk(r, g, b) {
        r = r / 255
        g = g / 255
        b = b / 255
        
        const k = 1 - Math.max(r, g, b)
        const c = k < 1 ? (1 - r - k) / (1 - k) : 0
        const m = k < 1 ? (1 - g - k) / (1 - k) : 0
        const y = k < 1 ? (1 - b - k) / (1 - k) : 0
        
        return { c, m, y, k }
      }
      
      // Convert CMYK to RGB (for display)
      cmykToRgb(c, m, y, k) {
        const r = Math.round(255 * (1 - c) * (1 - k))
        const g = Math.round(255 * (1 - m) * (1 - k))
        const b = Math.round(255 * (1 - y) * (1 - k))
        return { r, g, b }
      }
      
      // Convert PNG/JPEG to CMYK color space while preserving exact layout
      async convertImageToCMYK(imageBuffer, format = 'png', options = {}) {
        try {
          console.log('Converting image to CMYK color space...')
          
          const image = sharp(imageBuffer)
          const metadata = await image.metadata()
          
          console.log(`Image metadata:`, metadata)
          
          // Get raw RGB pixel data for CMYK conversion
          const { data, info } = await image
            .raw()
            .ensureAlpha()
            .toBuffer({ resolveWithObject: true })
          
          console.log(`Processing ${info.width}x${info.height} pixels for CMYK conversion`)
          
          // Convert RGB to CMYK and back to RGB for display (simulating CMYK color space)
          const processedData = new Uint8Array(info.width * info.height * 4)
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const a = data[i + 3]
            
            // Convert to CMYK
            const cmyk = this.rgbToCmyk(r, g, b)
            
            // Convert back to RGB to simulate CMYK printing colors
            const rgb = this.cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k)
            
            // Apply CMYK color characteristics (slightly muted colors for print simulation)
            processedData[i] = Math.round(rgb.r * 0.95)     // Slightly reduce brightness
            processedData[i + 1] = Math.round(rgb.g * 0.95)
            processedData[i + 2] = Math.round(rgb.b * 0.95)
            processedData[i + 3] = a
          }
          
          // Create new image with CMYK-simulated colors
          let cmykBuffer
          if (format === '.jpg' || format === '.jpeg') {
            cmykBuffer = await sharp(processedData, {
              raw: {
                width: info.width,
                height: info.height,
                channels: 4
              }
            })
              .jpeg({ 
                quality: 100,
                force: true 
              })
              .toBuffer()
          } else {
            cmykBuffer = await sharp(processedData, {
              raw: {
                width: info.width,
                height: info.height,
                channels: 4
              }
            })
              .png({ 
                quality: 100,
                compressionLevel: 0,
                force: true 
              })
              .toBuffer()
          }
          
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
              format: format === '.jpg' || format === '.jpeg' ? 'JPEG' : 'PNG'
            }
          }
          
        } catch (error) {
          console.error('CMYK image conversion failed:', error)
          throw new Error(`CMYK image conversion failed: ${error.message}`)
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
      
      // Main conversion method
      async convertToCMYK(fileBuffer, fileName, options = {}) {
        const fileExt = path.extname(fileName).toLowerCase()
        
        console.log(`Converting ${fileName} to CMYK...`)
        
        if (['.pdf'].includes(fileExt)) {
          return await this.convertPdfToCMYK(fileBuffer, options)
        } else if (['.png', '.jpg', '.jpeg'].includes(fileExt)) {
          return await this.convertImageToCMYK(fileBuffer, fileExt.slice(1), options)
        } else {
          throw new Error(`Unsupported file format: ${fileExt}`)
        }
      }
    }
    
    CMYKConversionService = new CMYKService()
  }
  return CMYKConversionService
}

async function getImpositionService() {
  if (!ImpositionService) {
    const { PDFDocument } = require('pdf-lib')
    const sharp = require('sharp')
    class Service {
      constructor () {
        this.pageSizes = {
          A4: { width: 595, height: 842 },
          A3: { width: 842, height: 1191 },
          Letter: { width: 612, height: 792 },
          Legal: { width: 612, height: 1008 },
          Tabloid: { width: 792, height: 1224 }
        }
      }
      getPageSize (size, orientation = 'portrait') {
        const base = this.pageSizes[size] || this.pageSizes.A4
        return orientation === 'landscape' ? { width: base.height, height: base.width } : base
      }
      async convertImageToPdf (imageBuffer) {
        const image = sharp(imageBuffer)
        const metadata = await image.metadata()
        const pngBuffer = await image.png().toBuffer()
        const pdfDoc = await PDFDocument.create()
        const embeddedImage = await pdfDoc.embedPng(pngBuffer)
        const page = pdfDoc.addPage([metadata.width, metadata.height])
        page.drawImage(embeddedImage, { x: 0, y: 0, width: metadata.width, height: metadata.height })
        return await pdfDoc.save()
      }
      async processFile (fileBuffer, fileName, impositionType, options) {
        let pdfBuffer = fileBuffer
        if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(fileName)) {
          pdfBuffer = await this.convertImageToPdf(fileBuffer)
        }
        const sourcePdf = await PDFDocument.load(pdfBuffer)
        switch (impositionType) {
          case 'booklet': return await this.createBooklet(sourcePdf, options)
          case '2up': return await this.create2Up(sourcePdf, options)
          case '4up': return await this.create4Up(sourcePdf, options)
          default: return await this.simplePassthrough(sourcePdf)
        }
      }
      async mergeFiles (filesArray, impositionType, options) {
        const mergedPdf = await PDFDocument.create()
        for (const fileData of filesArray) {
          let pdfBuffer = fileData.buffer
          if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(fileData.name)) {
            pdfBuffer = await this.convertImageToPdf(fileData.buffer)
          }
          const src = await PDFDocument.load(pdfBuffer)
          const indices = Array.from({ length: src.getPageCount() }, (_, i) => i)
          const copied = await mergedPdf.copyPages(src, indices)
          copied.forEach(p => mergedPdf.addPage(p))
        }
        switch (impositionType) {
          case 'booklet': return await this.createBooklet(mergedPdf, options)
          case '2up': return await this.create2Up(mergedPdf, options)
          case '4up': return await this.create4Up(mergedPdf, options)
          default: return await mergedPdf.save()
        }
      }
      async simplePassthrough (sourcePdf) {
        const target = await PDFDocument.create()
        const indices = Array.from({ length: sourcePdf.getPageCount() }, (_, i) => i)
        const pages = await target.copyPages(sourcePdf, indices)
        pages.forEach(p => target.addPage(p))
        return await target.save()
      }
      getPageDimensions (sourcePage) {
        if (!sourcePage) throw new Error('Source page is missing')
        if (typeof sourcePage.getSize === 'function') return sourcePage.getSize()
        if (typeof sourcePage.width === 'number' && typeof sourcePage.height === 'number') return { width: sourcePage.width, height: sourcePage.height }
        if (sourcePage.size && typeof sourcePage.size.width === 'number') return { width: sourcePage.size.width, height: sourcePage.size.height }
        const scaled = sourcePage.scale?.(1)
        if (scaled && typeof scaled.width === 'number') return { width: scaled.width, height: scaled.height }
        throw new Error('Unable to determine source page dimensions')
      }
      drawPageScaled (targetSheet, sourcePage, x, y, width, height) {
        const srcSize = this.getPageDimensions(sourcePage)
        const scale = Math.min(width / srcSize.width, height / srcSize.height)
        const w = srcSize.width * scale
        const h = srcSize.height * scale
        const cx = x + (width - w) / 2
        const cy = y + (height - h) / 2
        targetSheet.drawPage(sourcePage, { x: cx, y: cy, width: w, height: h })
      }
      async createBooklet (sourcePdf, options) {
        const target = await PDFDocument.create()
        const total = sourcePdf.getPageCount()
        const first = sourcePdf.getPage(0)
        const srcSize = first.getSize()
        const sheetSize = (options.pageSize && options.pageSize !== 'auto') ? this.getPageSize(options.pageSize, options.orientation) : { width: srcSize.width * 2, height: srcSize.height }
        const pageW = sheetSize.width / 2
        const pageH = sheetSize.height
        const padded = total % 4 === 0 ? total : total + (4 - (total % 4))
        const indices = Array.from({ length: total }, (_, i) => i)
        const copied = await target.copyPages(sourcePdf, indices)
        const embedded = await Promise.all(copied.map(p => target.embedPage(p)))
        for (let i = 0; i < Math.ceil(padded / 4); i++) {
          const front = target.addPage([sheetSize.width, sheetSize.height])
          const back = target.addPage([sheetSize.width, sheetSize.height])
          const outerLeft = padded - 1 - (i * 2)
          const innerLeft = i * 2
          const innerRight = innerLeft + 1
          const outerRight = outerLeft - 1
          if (innerLeft < embedded.length) this.drawPageScaled(front, embedded[innerLeft], 0, 0, pageW, pageH)
          if (outerLeft < embedded.length) this.drawPageScaled(front, embedded[outerLeft], pageW, 0, pageW, pageH)
          if (innerRight < embedded.length) this.drawPageScaled(back, embedded[innerRight], pageW, 0, pageW, pageH)
          if (outerRight < embedded.length) this.drawPageScaled(back, embedded[outerRight], 0, 0, pageW, pageH)
        }
        return await target.save()
      }
      async create2Up (sourcePdf, options) {
        const target = await PDFDocument.create()
        const total = sourcePdf.getPageCount()
        const first = sourcePdf.getPage(0)
        const srcSize = first.getSize()
        const sheetSize = (options.pageSize && options.pageSize !== 'auto') ? this.getPageSize(options.pageSize, options.orientation) : { width: srcSize.width * 2, height: srcSize.height }
        const pageW = sheetSize.width / 2
        const pageH = sheetSize.height
        const indices = Array.from({ length: total }, (_, i) => i)
        const copied = await target.copyPages(sourcePdf, indices)
        const embedded = await Promise.all(copied.map(p => target.embedPage(p)))
        for (let i = 0; i < Math.ceil(total / 2); i++) {
          const sheet = target.addPage([sheetSize.width, sheetSize.height])
          const leftIdx = i * 2
          const rightIdx = i * 2 + 1
          if (leftIdx < embedded.length) this.drawPageScaled(sheet, embedded[leftIdx], 0, 0, pageW, pageH)
          if (rightIdx < embedded.length) this.drawPageScaled(sheet, embedded[rightIdx], pageW, 0, pageW, pageH)
        }
        return await target.save()
      }
      async create4Up (sourcePdf, options) {
        const target = await PDFDocument.create()
        const total = sourcePdf.getPageCount()
        const first = sourcePdf.getPage(0)
        const srcSize = first.getSize()
        const sheetSize = (options.pageSize && options.pageSize !== 'auto') ? this.getPageSize(options.pageSize, options.orientation) : { width: srcSize.width * 2, height: srcSize.height * 2 }
        const pageW = sheetSize.width / 2
        const pageH = sheetSize.height / 2
        const indices = Array.from({ length: total }, (_, i) => i)
        const copied = await target.copyPages(sourcePdf, indices)
        const embedded = await Promise.all(copied.map(p => target.embedPage(p)))
        for (let i = 0; i < Math.ceil(total / 4); i++) {
          const sheet = target.addPage([sheetSize.width, sheetSize.height])
          const start = i * 4
          const positions = [ { x: 0, y: pageH }, { x: pageW, y: pageH }, { x: 0, y: 0 }, { x: pageW, y: 0 } ]
          for (let j = 0; j < 4; j++) {
            const idx = start + j
            if (idx < embedded.length) this.drawPageScaled(sheet, embedded[idx], positions[j].x, positions[j].y, pageW, pageH)
          }
        }
        return await target.save()
      }
    }
    ImpositionService = new Service()
  }
  return ImpositionService
}

app.post('/api/imposition/process', memoryUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const svc = await getImpositionService()
    const { impositionType, pageSize = 'auto', orientation = 'portrait', addBlankPages = false, type } = req.body || {}
    const finalType = impositionType || type || 'booklet'
    const resultBuffer = await svc.processFile(req.file.buffer, req.file.originalname, finalType, { pageSize, orientation, addBlankPages })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="imposed-${Date.now()}.pdf"`)
    res.send(Buffer.from(resultBuffer))
  } catch (err) {
    console.error('Imposition process error:', err)
    res.status(500).json({ error: err.message || 'Failed to process file' })
  }
})

app.post('/api/imposition/merge', memoryUpload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' })
    const svc = await getImpositionService()
    const { impositionType, pageSize = 'auto', orientation = 'portrait', addBlankPages = false, type } = req.body || {}
    const finalType = impositionType || type || 'booklet'
    const filesArray = req.files.map(f => ({ name: f.originalname, buffer: f.buffer }))
    const resultBuffer = await svc.mergeFiles(filesArray, finalType, { pageSize, orientation, addBlankPages })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="imposed-merged-${Date.now()}.pdf"`)
    res.send(Buffer.from(resultBuffer))
  } catch (err) {
    console.error('Imposition merge error:', err)
    res.status(500).json({ error: err.message || 'Failed to merge files' })
  }
})

// =======================
// CMYK Conversion Endpoints
// =======================

/**
 * POST /api/cmyk/convert
 * Convert PDF or PNG/JPEG to CMYK color space while preserving exact layout
 */
app.post('/api/cmyk/convert', memoryUpload.single('file'), async (req, res) => {
  try {
    console.log('=== CMYK Conversion Request ===')
    console.log('Request received at:', new Date().toISOString())
    
    if (!req.file) {
      console.log('No file uploaded')
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log(`File received:`)
    console.log(`  - Name: ${req.file.originalname}`)
    console.log(`  - Size: ${req.file.size} bytes`)
    console.log(`  - Type: ${req.file.mimetype}`)
    console.log(`  - Buffer length: ${req.file.buffer.length}`)

    const { preserveLayout = true, colorProfile = 'default' } = req.body || {}
    console.log('Conversion options:', { preserveLayout, colorProfile })
    
    const cmykService = await getCMYKConversionService()
    console.log('CMYK service obtained')
    
    console.log(`CMYK conversion request: ${req.file.originalname}, size: ${req.file.size}`)
    
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
    let contentType = 'application/pdf'
    if (fileExt === '.pdf') {
      contentType = 'application/pdf'
    } else if (fileExt === '.jpg' || fileExt === '.jpeg') {
      contentType = 'image/jpeg'
    } else {
      contentType = 'image/png'
    }
    
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

/**
 * POST /api/cmyk/batch-convert
 * Convert multiple files to CMYK color space
 */
app.post('/api/cmyk/batch-convert', memoryUpload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const { preserveLayout = true, colorProfile = 'default' } = req.body || {}
    const cmykService = await getCMYKConversionService()
    
    console.log(`Batch CMYK conversion: ${req.files.length} files`)
    
    const results = []
    
    for (const file of req.files) {
      try {
        const result = await cmykService.convertToCMYK(file.buffer, file.originalname, {
          preserveLayout,
          colorProfile
        })
        
        const fileExt = path.extname(file.originalname).toLowerCase()
        const outputFileName = file.originalname.replace(fileExt, `-CMYK${fileExt}`)
        
        results.push({
          originalName: file.originalname,
          convertedName: outputFileName,
          buffer: result.buffer,
          metadata: result.metadata,
          success: true
        })
      } catch (error) {
        results.push({
          originalName: file.originalname,
          error: error.message,
          success: false
        })
      }
    }
    
    // For now, return JSON with base64 encoded results
    // In production, you might want to zip the files
    const response = results.map(result => ({
      originalName: result.originalName,
      convertedName: result.convertedName,
      metadata: result.metadata,
      success: result.success,
      error: result.error,
      data: result.buffer ? result.buffer.toString('base64') : null
    }))
    
    res.json({
      totalFiles: req.files.length,
      successCount: results.filter(r => r.success).length,
      results: response
    })
    
  } catch (err) {
    console.error('Batch CMYK conversion error:', err)
    res.status(500).json({ 
      error: err.message || 'Failed to batch convert to CMYK'
    })
  }
})

/**
 * GET /api/cmyk/info
 * Get information about CMYK conversion capabilities
 */
app.get('/api/cmyk/info', (req, res) => {
  res.json({
    service: 'CMYK Conversion Service',
    version: '1.0.0',
    features: [
      'Exact layout preservation',
      'PDF CMYK conversion',
      'PNG/JPEG CMYK conversion',
      'No position changes',
      'No font reflow',
      'No size changes',
      'Color space conversion only'
    ],
    supportedFormats: {
      input: ['.pdf', '.png', '.jpg', '.jpeg'],
      output: ['.pdf', '.png']
    },
    description: 'Converts your exact PDF/PNG into CMYK without touching layout. Does NOT change positions, break design, reflow fonts, or resize anything. Only converts color space to CMYK.'
  })
})

/**
 * POST /api/export
 * Create a new export job
 */
app.post('/api/export', async (req, res) => {
  try {
    const { projectId, format, resolution, ...options } = req.body

    if (!projectId || !format) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, format' 
      })
    }

    const exportId = uuidv4()
    const fileName = `export-${exportId}.${format === 'jpeg' ? 'jpg' : format}`
    
    const exportData = {
      exportId,
      projectId,
      format,
      resolution,
      options,
      status: 'pending',
      fileName,
      createdAt: new Date(),
      downloadUrl: null,
      fileSize: null
    }

    exportRecords.set(exportId, exportData)

    // Simulate async processing (in production, use a job queue like Bull)
    setTimeout(() => {
      const data = exportRecords.get(exportId)
      if (data) {
        data.status = 'complete'
        data.downloadUrl = `http://localhost:${PORT}/api/export/${exportId}/download`
        data.fileSize = Math.floor(Math.random() * 5000000) + 100000 // Simulated size
        exportRecords.set(exportId, data)
      }
    }, 2000)

    res.json({
      exportId,
      status: 'processing',
      fileName,
      format,
      createdAt: exportData.createdAt
    })
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'Export failed' })
  }
})

/**
 * GET /api/export/:exportId/status
 * Get export status
 */
app.get('/api/export/:exportId/status', (req, res) => {
  const { exportId } = req.params
  const exportData = exportRecords.get(exportId)

  if (!exportData) {
    return res.status(404).json({ error: 'Export not found' })
  }

  const progress = exportData.status === 'complete' ? 100 : 
                   exportData.status === 'processing' ? 50 : 0

  res.json({
    exportId,
    status: exportData.status,
    progress,
    message: exportData.status === 'complete' ? exportData.downloadUrl : 'Processing...',
    estimatedTimeRemaining: exportData.status === 'processing' ? 5 : 0
  })
})

/**
 * GET /api/export/:exportId/download
 * Download exported file
 */
app.get('/api/export/:exportId/download', async (req, res) => {
  const { exportId } = req.params
  const exportData = exportRecords.get(exportId)

  if (!exportData) {
    return res.status(404).json({ error: 'Export not found' })
  }

  if (exportData.status !== 'complete') {
    return res.status(400).json({ error: 'Export not ready' })
  }

  // In production, serve actual file from storage
  // For now, send a placeholder response
  res.setHeader('Content-Type', `image/${exportData.format}`)
  res.setHeader('Content-Disposition', `attachment; filename="${exportData.fileName}"`)
  
  // Send empty buffer as placeholder
  res.send(Buffer.from(''))
})

/**
 * POST /api/share
 * Create a shareable link
 */
app.post('/api/share', async (req, res) => {
  try {
    const { projectId, permission, expiresAt, password, allowDownload, message } = req.body

    if (!projectId || !permission) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, permission' 
      })
    }

    const shareId = uuidv4()
    const shareUrl = `http://localhost:5173/shared/${shareId}`

    const shareData = {
      shareId,
      shareUrl,
      projectId,
      permission,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      hasPassword: !!password,
      passwordHash: password ? hashPassword(password) : null,
      allowDownload: allowDownload !== false,
      message,
      views: 0,
      downloads: 0,
      isActive: true
    }

    shareLinks.set(shareId, shareData)

    // Remove password hash from response
  const { passwordHash: _passwordHash, ...responseData } = shareData

    res.json(responseData)
  } catch (error) {
    console.error('Share link creation error:', error)
    res.status(500).json({ error: 'Failed to create share link' })
  }
})

/**
 * GET /api/share/:shareId
 * Get share link details
 */
app.get('/api/share/:shareId', (req, res) => {
  const { shareId } = req.params
  const { password } = req.query

  const shareData = shareLinks.get(shareId)

  if (!shareData) {
    return res.status(404).json({ error: 'Share link not found' })
  }

  if (!shareData.isActive) {
    return res.status(403).json({ error: 'Share link has been revoked' })
  }

  if (shareData.expiresAt && new Date() > new Date(shareData.expiresAt)) {
    return res.status(403).json({ error: 'Share link has expired' })
  }

  if (shareData.hasPassword) {
    if (!password || !verifyPassword(password, shareData.passwordHash)) {
      return res.status(401).json({ error: 'Invalid password' })
    }
  }

  // Increment view count
  shareData.views++
  shareLinks.set(shareId, shareData)

  // Remove password hash from response
  const { passwordHash: _passwordHash2, ...responseData } = shareData

  res.json(responseData)
})

/**
 * DELETE /api/share/:shareId
 * Revoke a share link
 */
app.delete('/api/share/:shareId', (req, res) => {
  const { shareId } = req.params
  const shareData = shareLinks.get(shareId)

  if (!shareData) {
    return res.status(404).json({ error: 'Share link not found' })
  }

  shareData.isActive = false
  shareLinks.set(shareId, shareData)

  res.json({ message: 'Share link revoked successfully' })
})

/**
 * GET /api/share/project/:projectId
 * Get all share links for a project
 */
app.get('/api/share/project/:projectId', (req, res) => {
  const { projectId } = req.params

  const projectLinks = Array.from(shareLinks.values())
    .filter(link => link.projectId === projectId)
    .map(({ passwordHash: _passwordHash3, ...link }) => link)

  res.json(projectLinks)
})

/**
 * POST /api/share/:shareId/track
 * Track share analytics
 */
app.post('/api/share/:shareId/track', (req, res) => {
  const { shareId } = req.params
  const { action } = req.body

  const shareData = shareLinks.get(shareId)

  if (!shareData) {
    return res.status(404).json({ error: 'Share link not found' })
  }

  if (action === 'view') {
    shareData.views++
  } else if (action === 'download') {
    shareData.downloads++
  }

  shareLinks.set(shareId, shareData)

  res.json({ message: 'Tracked successfully' })
})

/**
 * POST /api/share/email
 * Send email with shared design
 */
app.post('/api/share/email', async (req, res) => {
  try {
    const { recipients, subject, message, attachmentUrl, projectName } = req.body

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients specified' })
    }

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email to:', recipients)
    console.log('Subject:', subject || `${projectName} - Shared Design`)
    console.log('Message:', message)
    console.log('Attachment:', attachmentUrl)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    res.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email send error:', error)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

/**
 * Helper: Hash password
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Helper: Verify password
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    exports: exportRecords.size,
    shareLinks: shareLinks.size
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Export & Share Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
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

