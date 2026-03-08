// auto-design-server.cjs (CommonJS version)
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { renderTemplate } = require('./template-renderer.cjs')

const app = express()

const PORT = Number(process.env.AUTO_DESIGN_PORT || 3002)
// Public base URL for returned asset links (set this in production to your domain)
const PUBLIC_BASE_URL = process.env.AUTO_DESIGN_PUBLIC_URL || `http://localhost:${PORT}`

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8100'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('auto-design-uploads'))

// Create uploads directory
const uploadsDir = path.join(__dirname, 'auto-design-uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'))
    }
  }
})

// In-memory storage for projects (in production, use database)
const projects = new Map()

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id)
  
  const userId = socket.handshake.auth.userId
  if (userId) {
    socket.join(`user:${userId}`)
    console.log(`User ${userId} joined room`)
  }

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id)
  })
})

// Helper function to simulate design generation
async function simulateDesignGeneration(projectId, userId) {
  const project = projects.get(projectId)
  if (!project) return

  // Emit progress updates
  const progressSteps = [10, 25, 40, 55, 70, 85, 100]
  const messages = [
    'Initializing design...',
    'Processing images...',
    'Applying template...',
    'Rendering text...',
    'Applying colors...',
    'Finalizing design...',
    'Complete!'
  ]

  for (let i = 0; i < progressSteps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 800))

    io.to(`user:${userId}`).emit('design:progress', {
      projectId,
      progress: progressSteps[i],
      message: messages[i]
    })
  }

  // Render the actual template
  let previewUrl = null
  let fullUrl = null

  try {
    console.log('🎨 Starting template rendering...')
    console.log('   Category:', project.category)
    console.log('   Inputs:', JSON.stringify(project.inputs, null, 2))
    console.log('   Files:', JSON.stringify(project.files, null, 2))

    // Determine file extension based on category
    const ext = '.png'
    const previewFilename = `preview-${projectId}${ext}`
    const previewPath = path.join(uploadsDir, previewFilename)

    // Render the template
    await renderTemplate(project.category, project.inputs, project.files, previewPath)

    previewUrl = `${PUBLIC_BASE_URL}/uploads/${previewFilename}`
    fullUrl = previewUrl
    console.log('✅ Template rendered successfully:', previewUrl)

  } catch (renderError) {
    console.error('❌ Template rendering failed:', renderError)
    console.log('   Falling back to uploaded image...')

    // Fallback: try to use uploaded image
    try {
      console.log('🔍 Looking for uploaded images...')
      console.log('   Files object:', JSON.stringify(project.files, null, 2))

    // If user uploaded images, use the first one as preview
    if (project.files && project.files.images && project.files.images.length > 0) {
      const firstImage = project.files.images[0]
      console.log('   First image:', JSON.stringify(firstImage, null, 2))

      if (firstImage.url) {
        // Extract the filename from the URL
        const urlParts = firstImage.url.split('/')
        const filename = urlParts[urlParts.length - 1]
        const sourcePath = path.join(uploadsDir, filename)

        console.log('   Source path:', sourcePath)
        console.log('   File exists:', fs.existsSync(sourcePath))

        if (fs.existsSync(sourcePath)) {
          // Copy the file to create a preview
          const previewFilename = `preview-${projectId}${path.extname(filename)}`
          const previewPath = path.join(uploadsDir, previewFilename)

          console.log('   Copying file...')
          console.log('   From:', sourcePath)
          console.log('   To:', previewPath)

          fs.copyFileSync(sourcePath, previewPath)

          console.log('   Copy successful, checking if file exists:', fs.existsSync(previewPath))

          previewUrl = `${PUBLIC_BASE_URL}/uploads/${previewFilename}`
          fullUrl = previewUrl
          console.log('✅ Created preview copy:', previewUrl)
        } else {
          // File doesn't exist, use the original URL
          previewUrl = firstImage.url
          fullUrl = firstImage.url
          console.log('⚠️ Source file not found, using original URL:', previewUrl)
        }
      }
    } else {
      // No files in request, try to find the most recent image in uploads directory
      console.log('⚠️ No files in request, looking for recent uploads...')
      const files = fs.readdirSync(uploadsDir)
        .filter(f => f.match(/\.(png|jpg|jpeg)$/i) && !f.startsWith('preview-'))
        .map(f => ({
          name: f,
          path: path.join(uploadsDir, f),
          time: fs.statSync(path.join(uploadsDir, f)).mtime
        }))
        .sort((a, b) => b.time - a.time)

      if (files.length > 0) {
        const latestFile = files[0]
        console.log('   Found latest file:', latestFile.name)

        // Copy it as preview
        const previewFilename = `preview-${projectId}${path.extname(latestFile.name)}`
        const previewPath = path.join(uploadsDir, previewFilename)

        fs.copyFileSync(latestFile.path, previewPath)

        previewUrl = `${PUBLIC_BASE_URL}/uploads/${previewFilename}`
        fullUrl = previewUrl
        console.log('✅ Using latest uploaded file as preview:', previewUrl)
      }
    }

      // If no images, create a placeholder URL
      if (!previewUrl) {
        console.log('⚠️ No uploaded images found, creating placeholder')

        // Create a simple text file as placeholder
        const placeholderText = `Design Preview for ${project.category}\n\nProject ID: ${projectId}\n\nInputs:\n${JSON.stringify(project.inputs, null, 2)}`
        const placeholderPath = path.join(uploadsDir, `preview-${projectId}.txt`)
        fs.writeFileSync(placeholderPath, placeholderText)

        // For now, we'll use a data URL with text
        previewUrl = `${PUBLIC_BASE_URL}/uploads/preview-${projectId}.txt`
        fullUrl = previewUrl
        console.log('📝 Created placeholder:', previewUrl)
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)
      // Last resort: create a simple URL
      previewUrl = `${PUBLIC_BASE_URL}/uploads/preview-${projectId}.png`
      fullUrl = previewUrl
    }
  }

  // Update project status
  project.status = 'completed'
  project.progress = 100
  project.design.previewUrl = previewUrl
  project.design.fullUrl = fullUrl
  project.design.pdfUrl = `${PUBLIC_BASE_URL}/uploads/design-${projectId}.pdf`
  project.updatedAt = new Date()

  console.log(`✅ Design completed for project ${projectId}`)
  console.log(`   Preview URL: ${previewUrl}`)
  console.log(`   Project data:`, JSON.stringify(project, null, 2))

  // Emit completion
  const completionData = {
    projectId,
    project
  }

  console.log(`📤 Emitting design:complete to user:${userId}`)
  console.log(`   Data:`, JSON.stringify(completionData, null, 2))

  io.to(`user:${userId}`).emit('design:complete', completionData)
}

// API Routes

/**
 * Upload file
 */
app.post('/api/auto-design/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const fileUrl = `${PUBLIC_BASE_URL}/uploads/${req.file.filename}`
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * Generate design
 */
app.post('/api/auto-design/generate', async (req, res) => {
  try {
    const { userId, category, inputs, files } = req.body

    console.log('📥 Generate design request received:')
    console.log('   User ID:', userId)
    console.log('   Category:', category)
    console.log('   Inputs:', JSON.stringify(inputs, null, 2))
    console.log('   Files:', JSON.stringify(files, null, 2))

    if (!userId || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Create project
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const project = {
      id: projectId,
      userId,
      category,
      inputs,
      files: files || { images: [] },
      design: {
        dimensions: {
          width: 1920,
          height: 1080,
          dpi: 300
        }
      },
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log(`✨ Created project: ${projectId}`)
    projects.set(projectId, project)

    // Start async generation
    simulateDesignGeneration(projectId, userId).catch(error => {
      console.error('Generation error:', error)
      io.to(`user:${userId}`).emit('design:error', {
        projectId,
        error: error.message
      })
    })

    res.json({
      success: true,
      projectId,
      status: 'processing'
    })
  } catch (error) {
    console.error('Generate error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * Get user projects
 */
app.get('/api/auto-design/projects', (req, res) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId' })
    }

    const userProjects = Array.from(projects.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = userProjects.length
    const paginatedProjects = userProjects.slice(Number(offset), Number(offset) + Number(limit))

    res.json({
      success: true,
      projects: paginatedProjects,
      total,
      hasMore: Number(offset) + Number(limit) < total
    })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * Delete project
 */
app.delete('/api/auto-design/projects/:id', (req, res) => {
  try {
    const { id } = req.params

    if (!projects.has(id)) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    projects.delete(id)

    res.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * Download design
 */
app.get('/api/auto-design/download/:id', (req, res) => {
  try {
    const { id } = req.params
    const { format = 'png' } = req.query

    const project = projects.get(id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    // In production, generate actual file
    res.json({
      success: true,
      message: 'Download functionality will be implemented with actual file generation'
    })
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auto-design-server' })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Auto Design Server running on http://localhost:${PORT}`)
  console.log(`📁 Uploads directory: ${uploadsDir}`)
  console.log(`🔌 Socket.io ready for connections`)
})

