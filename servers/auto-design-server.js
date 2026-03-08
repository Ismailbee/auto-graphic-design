// auto-design-server.js
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = Number(process.env.AUTO_DESIGN_PORT || 3002)

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
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

  // Update project status
  project.status = 'completed'
  project.progress = 100
  const publicBaseUrl = process.env.AUTO_DESIGN_PUBLIC_URL || `http://localhost:${PORT}`
  project.design.previewUrl = `${publicBaseUrl}/uploads/preview-${projectId}.png`
  project.design.fullUrl = `${publicBaseUrl}/uploads/full-${projectId}.png`
  project.design.pdfUrl = `${publicBaseUrl}/uploads/design-${projectId}.pdf`
  project.updatedAt = new Date()

  // Emit completion
  io.to(`user:${userId}`).emit('design:complete', {
    projectId,
    project
  })
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

    const publicBaseUrl = process.env.AUTO_DESIGN_PUBLIC_URL || `http://localhost:${PORT}`
    const fileUrl = `${publicBaseUrl}/uploads/${req.file.filename}`
    
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

