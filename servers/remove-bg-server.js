/**
 * MODNet Background Removal Server
 * 
 * Node.js Express server for background removal using onnxruntime-node.
 * Provides fallback for devices that cannot run ONNX models locally.
 * 
 * Usage:
 *   npm install express multer sharp onnxruntime-node
 *   node server/remove-bg-server.js
 * 
 * API:
 *   POST /api/remove-bg
 *   Content-Type: multipart/form-data
 *   Body: image (file), format (optional, default: image/png)
 * 
 * @module remove-bg-server
 */

const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const ort = require('onnxruntime-node')
const path = require('path')
const fs = require('fs').promises

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  PORT: process.env.PORT || 3001,
  MODEL_PATH: process.env.MODEL_PATH || path.join(__dirname, '../public/models/modnet_photographic_portrait_matting.onnx'),
  INPUT_SIZE: 512,
  MEAN: [0.5, 0.5, 0.5],
  STD: [0.5, 0.5, 0.5],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
}

// ============================================================================
// SETUP
// ============================================================================

const app = express()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'))
    }
  },
})

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CONFIG.CORS_ORIGIN)
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  
  next()
})

// JSON body parser
app.use(express.json())

// ============================================================================
// ONNX SESSION
// ============================================================================

let session = null

/**
 * Initialize ONNX Runtime session
 */
async function initializeSession() {
  if (session) return session
  
  try {
    console.log('🚀 Loading ONNX model from:', CONFIG.MODEL_PATH)
    
    // Check if model file exists
    await fs.access(CONFIG.MODEL_PATH)
    
    // Create session with CPU execution provider
    session = await ort.InferenceSession.create(CONFIG.MODEL_PATH, {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all',
    })
    
    console.log('✅ ONNX session created successfully')
    console.log('📋 Input names:', session.inputNames)
    console.log('📋 Output names:', session.outputNames)
    
    // Warm-up
    console.log('🔥 Warming up model...')
    const dummyInput = new ort.Tensor(
      'float32',
      new Float32Array(3 * CONFIG.INPUT_SIZE * CONFIG.INPUT_SIZE),
      [1, 3, CONFIG.INPUT_SIZE, CONFIG.INPUT_SIZE]
    )
    await session.run({ [session.inputNames[0]]: dummyInput })
    console.log('✅ Warm-up complete')
    
    return session
  } catch (error) {
    console.error('❌ Failed to initialize ONNX session:', error)
    throw error
  }
}

// ============================================================================
// IMAGE PROCESSING
// ============================================================================

/**
 * Preprocess image for MODNet inference
 */
async function preprocessImage(imageBuffer) {
  const { INPUT_SIZE, MEAN, STD } = CONFIG
  
  // Resize and extract RGB data
  const { data, info } = await sharp(imageBuffer)
    .resize(INPUT_SIZE, INPUT_SIZE, {
      fit: 'fill',
      kernel: 'lanczos3',
    })
    .raw()
    .toBuffer({ resolveWithObject: true })
  
  // Convert to CHW format and normalize
  const inputData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE)
  
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    const r = data[i * 3] / 255.0
    const g = data[i * 3 + 1] / 255.0
    const b = data[i * 3 + 2] / 255.0
    
    inputData[i] = (r - MEAN[0]) / STD[0]
    inputData[INPUT_SIZE * INPUT_SIZE + i] = (g - MEAN[1]) / STD[1]
    inputData[INPUT_SIZE * INPUT_SIZE * 2 + i] = (b - MEAN[2]) / STD[2]
  }
  
  return new ort.Tensor('float32', inputData, [1, 3, INPUT_SIZE, INPUT_SIZE])
}

/**
 * Postprocess model output and composite with original image
 */
async function postprocessOutput(outputTensor, originalImageBuffer, outputFormat) {
  const { INPUT_SIZE } = CONFIG
  
  // Get original image metadata
  const originalImage = sharp(originalImageBuffer)
  const metadata = await originalImage.metadata()
  const { width: origWidth, height: origHeight } = metadata
  
  // Extract alpha mask from output tensor
  const outputData = outputTensor.data
  
  // Create alpha mask buffer
  const maskBuffer = Buffer.alloc(INPUT_SIZE * INPUT_SIZE)
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    const alpha = Math.max(0, Math.min(1, outputData[i]))
    maskBuffer[i] = Math.round(alpha * 255)
  }
  
  // Resize mask to original dimensions
  const resizedMask = await sharp(maskBuffer, {
    raw: {
      width: INPUT_SIZE,
      height: INPUT_SIZE,
      channels: 1,
    },
  })
    .resize(origWidth, origHeight, {
      kernel: 'lanczos3',
    })
    .raw()
    .toBuffer()
  
  // Get original image as RGBA
  const originalRGBA = await originalImage
    .ensureAlpha()
    .raw()
    .toBuffer()
  
  // Apply alpha mask
  for (let i = 0; i < origWidth * origHeight; i++) {
    originalRGBA[i * 4 + 3] = resizedMask[i]
  }
  
  // Convert to output format
  const format = outputFormat === 'image/webp' ? 'webp' : 'png'
  const outputBuffer = await sharp(originalRGBA, {
    raw: {
      width: origWidth,
      height: origHeight,
      channels: 4,
    },
  })
    .toFormat(format, {
      quality: 95,
      compressionLevel: 6,
    })
    .toBuffer()
  
  return {
    buffer: outputBuffer,
    width: origWidth,
    height: origHeight,
    format,
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: session ? 'loaded' : 'not loaded',
    timestamp: new Date().toISOString(),
  })
})

/**
 * Background removal endpoint
 */
app.post('/api/remove-bg', upload.single('image'), async (req, res) => {
  const startTime = Date.now()
  
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
        message: 'Please upload an image file',
      })
    }
    
    console.log(`📥 Received image: ${req.file.originalname} (${req.file.size} bytes)`)
    
    // Get output format
    const outputFormat = req.body.format || 'image/png'
    
    // Initialize session if needed
    await initializeSession()
    
    // Preprocess
    console.log('🔄 Preprocessing...')
    const inputTensor = await preprocessImage(req.file.buffer)
    
    // Run inference
    console.log('🧠 Running inference...')
    const inputName = session.inputNames[0]
    const outputName = session.outputNames[0]
    const results = await session.run({ [inputName]: inputTensor })
    const outputTensor = results[outputName]
    
    // Postprocess
    console.log('🎨 Postprocessing...')
    const { buffer, width, height, format } = await postprocessOutput(
      outputTensor,
      req.file.buffer,
      outputFormat
    )
    
    const processingTime = Date.now() - startTime
    console.log(`✅ Completed in ${processingTime}ms`)
    
    // Send response
    res.set({
      'Content-Type': `image/${format}`,
      'Content-Length': buffer.length,
      'X-Processing-Time': processingTime,
      'X-Image-Width': width,
      'X-Image-Height': height,
    })
    
    res.send(buffer)
  } catch (error) {
    console.error('❌ Error processing image:', error)
    
    res.status(500).json({
      error: 'Processing failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
})

/**
 * Error handler
 */
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: `Maximum file size is ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
      })
    }
  }
  
  console.error('❌ Unhandled error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  })
})

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
  try {
    // Initialize session on startup
    await initializeSession()
    
    // Start server
    app.listen(CONFIG.PORT, () => {
      console.log(`🚀 MODNet Background Removal Server running on port ${CONFIG.PORT}`)
      console.log(`📍 Endpoint: http://localhost:${CONFIG.PORT}/api/remove-bg`)
      console.log(`🏥 Health check: http://localhost:${CONFIG.PORT}/health`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Memory cleanup function
const cleanupMemory = () => {
  if (global.gc) {
    global.gc()
    console.log('🧹 Background Removal Server: Memory cleanup executed')
  }
  
  const memUsage = process.memoryUsage()
  console.log('📊 BG Removal Memory:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB'
  })
}

// Set up memory monitoring (every 5 minutes)
const memoryInterval = setInterval(cleanupMemory, 5 * 60 * 1000)

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...')
  clearInterval(memoryInterval)
  cleanupMemory()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...')
  clearInterval(memoryInterval)
  cleanupMemory()
  process.exit(0)
})

// Start the server
start()

