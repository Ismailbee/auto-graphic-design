import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import impositionService from './services/impositionService.js';
import {
  listTemplates,
  listCategories,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from './services/templatesService.js';
import {
  listDesigns,
  getDesign,
  createDesign,
  updateDesign,
  deleteDesign,
} from './services/designsService.js';
import {
  listAssets,
  getAsset,
  uploadAsset,
  updateAsset,
  deleteAsset,
} from './services/assetsService.js';
import { listUsers, getUser, updateUser } from './services/usersService.js';
import { suggestSearchResults } from './services/searchService.js';
import {
  register,
  login,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  changePassword
} from './services/authService.js';
import {
  listComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getCommentStats
} from './services/commentsService.js';
import { authenticate, authorize, optionalAuth } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3001;
const STORAGE_ROOT = path.join(process.cwd(), 'storage');

// Configure CORS
app.use(cors({
  origin: ['http://localhost:8100', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(STORAGE_ROOT, 'assets')));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and image files are allowed.'));
    }
  }
});

const assetsUpload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      const error = new Error('Unsupported asset file type');
      error.status = 400;
      cb(error);
    }
  },
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Auto Graphic Design Backend Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        me: 'GET /api/auth/me',
        updateProfile: 'PATCH /api/auth/profile',
        changePassword: 'POST /api/auth/change-password'
      },
      impose: 'POST /api/impose',
      templates: {
        list: 'GET /api/templates',
        categories: 'GET /api/templates/categories',
        create: 'POST /api/templates',
        update: 'PUT /api/templates/:id',
        remove: 'DELETE /api/templates/:id'
      },
      designs: {
        list: 'GET /api/designs',
        create: 'POST /api/designs',
        update: 'PUT /api/designs/:id',
        remove: 'DELETE /api/designs/:id'
      },
      assets: {
        list: 'GET /api/assets',
        upload: 'POST /api/assets/upload',
        update: 'PUT /api/assets/:id',
        remove: 'DELETE /api/assets/:id'
      },
      comments: {
        list: 'GET /api/comments',
        create: 'POST /api/comments',
        update: 'PUT /api/comments/:id',
        remove: 'DELETE /api/comments/:id',
        like: 'POST /api/comments/:id/like',
        stats: 'GET /api/comments/stats'
      },
      search: 'GET /api/search/suggestions',
      users: {
        list: 'GET /api/users',
        get: 'GET /api/users/:id',
        update: 'PATCH /api/users/:id'
      }
    }
  });
});

// ============================================
// AUTH ENDPOINTS
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Email and password are required'
      });
    }

    const result = await register({ email, password, name });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Login user
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Email and password are required'
      });
    }

    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Refresh access token
app.post('/api/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Refresh token is required'
      });
    }

    const result = await refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get current user
app.get('/api/auth/me', authenticate, async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
app.patch('/api/auth/profile', authenticate, async (req, res, next) => {
  try {
    const user = await updateProfile(req.user.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Change password
app.post('/api/auth/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Current password and new password are required'
      });
    }

    const result = await changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// COMMENTS ENDPOINTS
// ============================================

// List comments (with optional filters)
app.get('/api/comments', optionalAuth, async (req, res, next) => {
  try {
    const { templateId, designId, userId } = req.query;
    const comments = await listComments({ templateId, designId, userId });
    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// Get comment stats
app.get('/api/comments/stats', async (req, res, next) => {
  try {
    const { templateId, designId } = req.query;
    const stats = await getCommentStats(templateId, designId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get single comment
app.get('/api/comments/:id', async (req, res, next) => {
  try {
    const comment = await getComment(req.params.id);
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Create comment (requires auth)
app.post('/api/comments', authenticate, async (req, res, next) => {
  try {
    const comment = await createComment(req.body, req.user.id);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// Update comment (requires auth)
app.put('/api/comments/:id', authenticate, async (req, res, next) => {
  try {
    const comment = await updateComment(req.params.id, req.body, req.user.id);
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Delete comment (requires auth)
app.delete('/api/comments/:id', authenticate, async (req, res, next) => {
  try {
    const comment = await deleteComment(req.params.id, req.user.id, req.user.role);
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Like/Unlike comment (requires auth)
app.post('/api/comments/:id/like', authenticate, async (req, res, next) => {
  try {
    const result = await toggleCommentLike(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// EXISTING ENDPOINTS
// ============================================

app.get('/api/templates', async (req, res, next) => {
  try {
    const { category } = req.query;
    const templates = await listTemplates(category);
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

app.get('/api/templates/categories', async (req, res, next) => {
  try {
    const categories = await listCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

app.get('/api/templates/:id', async (req, res, next) => {
  try {
    const template = await getTemplate(req.params.id);
    res.json(template);
  } catch (error) {
    next(error);
  }
});

app.post('/api/templates', async (req, res, next) => {
  try {
    const template = await createTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

app.put('/api/templates/:id', async (req, res, next) => {
  try {
    const template = await updateTemplate(req.params.id, req.body);
    res.json(template);
  } catch (error) {
    next(error);
  }
});

app.get('/api/designs', async (req, res, next) => {
  try {
    const { templateId } = req.query;
    const designs = await listDesigns(templateId);
    res.json(designs);
  } catch (error) {
    next(error);
  }
});

app.get('/api/designs/:id', async (req, res, next) => {
  try {
    const design = await getDesign(req.params.id);
    res.json(design);
  } catch (error) {
    next(error);
  }
});

app.post('/api/designs', async (req, res, next) => {
  try {
    const design = await createDesign(req.body);
    res.status(201).json(design);
  } catch (error) {
    next(error);
  }
});

app.put('/api/designs/:id', async (req, res, next) => {
  try {
    const design = await updateDesign(req.params.id, req.body);
    res.json(design);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/designs/:id', async (req, res, next) => {
  try {
    const design = await deleteDesign(req.params.id);
    res.json(design);
  } catch (error) {
    next(error);
  }
});

app.get('/api/assets', async (req, res, next) => {
  try {
    const { tag } = req.query;
    const assets = await listAssets(tag);
    res.json(assets);
  } catch (error) {
    next(error);
  }
});

app.get('/api/assets/:id', async (req, res, next) => {
  try {
    const asset = await getAsset(req.params.id);
    res.json(asset);
  } catch (error) {
    next(error);
  }
});

app.post('/api/assets/upload', assetsUpload.single('file'), async (req, res, next) => {
  try {
    const asset = await uploadAsset(req.file);
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
});

app.put('/api/assets/:id', async (req, res, next) => {
  try {
    const asset = await updateAsset(req.params.id, req.body);
    res.json(asset);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/assets/:id', async (req, res, next) => {
  try {
    const asset = await deleteAsset(req.params.id);
    res.json(asset);
  } catch (error) {
    next(error);
  }
});

app.get('/api/search/suggestions', async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await suggestSearchResults(q ?? '');
    res.json(results);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users', async (req, res, next) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await getUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/users/:id', async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/templates/:id', async (req, res, next) => {
  try {
    const removed = await deleteTemplate(req.params.id);
    res.json(removed);
  } catch (error) {
    next(error);
  }
});

// Main imposition endpoint
app.post('/api/impose', upload.single('file'), async (req, res) => {
  console.log('📄 Imposition request received');
  console.log('Body:', req.body);
  console.log('File:', req.file ? { name: req.file.originalname, size: req.file.size, type: req.file.mimetype } : 'No file');

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        details: 'Please upload a PDF or image file'
      });
    }

    const {
      type = 'booklet',
      pageSize = 'A4',
      customWidth,
      customHeight,
      duplex = 'long-edge',
      addBlankPages = 'true',
      addCropMarks = 'false'
    } = req.body;

    console.log('🔧 Processing with options:', {
      type, pageSize, customWidth, customHeight, duplex, addBlankPages, addCropMarks
    });

    // Process the imposition
    const resultBuffer = await impositionService.processFile(
      req.file.buffer,
      req.file.originalname,
      type,
      {
        pageSize,
        customWidth,
        customHeight,
        duplex,
        addBlankPages,
        addCropMarks
      }
    );

    console.log('✅ Imposition completed successfully');

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="imposed-${type}-${req.file.originalname}.pdf"`);
    res.setHeader('Content-Length', resultBuffer.length);

    res.send(Buffer.from(resultBuffer));

  } catch (error) {
    console.error('❌ Error processing imposition:', error);
    
    res.status(500).json({
      error: 'Imposition processing failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);

  if (error.status) {
    return res.status(error.status).json({
      error: error.message,
    });
  }
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        details: 'File size must be less than 50MB'
      });
    }
  }
  
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Imposition backend server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: http://localhost:8100, http://localhost:5173`);
  console.log(`📄 Ready to process PDF and image files`);
});