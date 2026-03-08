/**
 * Real-Time Collaboration Server
 * 
 * This is a simple Socket.io server for real-time collaboration features.
 * 
 * Setup:
 * 1. npm install express socket.io cors
 * 2. node collaboration-server.js
 * 
 * The server will run on http://localhost:3000
 */

const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vue dev server
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Store active users per project
const projectRooms = new Map()

// Store canvas state per project (for sync)
const projectCanvasState = new Map()

// Helper function to get room users
function getRoomUsers(projectId) {
  return projectRooms.get(projectId) || []
}

// Helper function to add user to room
function addUserToRoom(projectId, user) {
  if (!projectRooms.has(projectId)) {
    projectRooms.set(projectId, [])
  }
  const room = projectRooms.get(projectId)
  
  // Remove existing user if already in room
  const existingIndex = room.findIndex(u => u.id === user.id)
  if (existingIndex !== -1) {
    room.splice(existingIndex, 1)
  }
  
  room.push(user)
  return room
}

// Helper function to remove user from room
function removeUserFromRoom(projectId, userId) {
  if (!projectRooms.has(projectId)) return []
  
  const room = projectRooms.get(projectId)
  const index = room.findIndex(u => u.id === userId)
  if (index !== -1) {
    room.splice(index, 1)
  }
  
  return room
}

console.log('🚀 Starting Real-Time Collaboration Server...')

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id)
  
  // Join project room
  socket.on('project:join', (payload) => {
    const { projectId, userId, userName, color, role } = payload
    
    console.log(`📍 User "${userName}" (${userId}) joining project: ${projectId}`)
    
    // Join the Socket.io room
    socket.join(projectId)
    
    // Store user info
    socket.userId = userId
    socket.projectId = projectId
    socket.userName = userName
    
    // Add user to room
    const user = {
      id: userId,
      name: userName,
      email: payload.email || `${userName}@example.com`,
      color: color,
      role: role || 'editor',
      isOnline: true
    }
    
    const room = addUserToRoom(projectId, user)
    
    // Broadcast to others in room that new user joined
    socket.to(projectId).emit('user:join', payload)
    
    // Send current users list to new user
    socket.emit('user:list', room)
    
    // Send current canvas state if available
    if (projectCanvasState.has(projectId)) {
      socket.emit('canvas:sync', projectCanvasState.get(projectId))
    }
    
    console.log(`   Active users in ${projectId}:`, room.length)
  })
  
  // Leave project room
  socket.on('project:leave', (payload) => {
    const { projectId, userId, userName } = payload
    
    console.log(`📍 User "${userName}" (${userId}) leaving project: ${projectId}`)
    
    socket.leave(projectId)
    
    // Remove user from room
    removeUserFromRoom(projectId, userId)
    
    // Broadcast to others
    socket.to(projectId).emit('user:leave', payload)
  })
  
  // Canvas updates
  socket.on('canvas:update', (payload) => {
    const { projectId, updateType, objectType } = payload
    
    console.log(`📝 Canvas update in ${projectId}: ${updateType} ${objectType}`)
    
    // Update stored canvas state
    if (!projectCanvasState.has(projectId)) {
      projectCanvasState.set(projectId, { objects: [] })
    }
    
    const canvasState = projectCanvasState.get(projectId)
    
    // Apply update to state
    if (updateType === 'add') {
      canvasState.objects.push(payload.data)
    } else if (updateType === 'update') {
      const index = canvasState.objects.findIndex(obj => obj.id === payload.objectId)
      if (index !== -1) {
        canvasState.objects[index] = { ...canvasState.objects[index], ...payload.data }
      }
    } else if (updateType === 'delete') {
      const index = canvasState.objects.findIndex(obj => obj.id === payload.objectId)
      if (index !== -1) {
        canvasState.objects.splice(index, 1)
      }
    }
    
    // Broadcast to others in room (not sender)
    socket.to(projectId).emit('canvas:update', payload)
  })
  
  // Cursor tracking
  socket.on('cursor:move', (payload) => {
    // Broadcast cursor position to others (high frequency, no logging)
    socket.to(payload.projectId).emit('cursor:move', payload)
  })
  
  socket.on('cursor:hide', (data) => {
    socket.to(data.projectId).emit('cursor:hide', data)
  })
  
  // Comments
  socket.on('comment:add', (payload) => {
    console.log(`💬 Comment added in ${payload.projectId}`)
    // Broadcast to all in room (including sender for confirmation)
    io.to(payload.projectId).emit('comment:add', payload)
  })
  
  socket.on('comment:update', (payload) => {
    console.log(`💬 Comment updated in ${payload.projectId}`)
    io.to(payload.projectId).emit('comment:update', payload)
  })
  
  socket.on('comment:delete', (payload) => {
    console.log(`💬 Comment deleted in ${payload.projectId}`)
    io.to(payload.projectId).emit('comment:delete', payload)
  })
  
  socket.on('comment:resolve', (payload) => {
    console.log(`✅ Comment resolved in ${payload.projectId}`)
    io.to(payload.projectId).emit('comment:resolve', payload)
  })
  
  // Chat messages
  socket.on('chat:message', (payload) => {
    console.log(`💬 Chat message in ${payload.projectId} from ${payload.userName}`)
    io.to(payload.projectId).emit('chat:message', payload)
  })
  
  // Canvas sync request
  socket.on('canvas:sync:request', (data) => {
    const { projectId } = data
    console.log(`🔄 Canvas sync requested for ${projectId}`)
    
    if (projectCanvasState.has(projectId)) {
      socket.emit('canvas:sync', projectCanvasState.get(projectId))
    } else {
      socket.emit('canvas:sync', { objects: [] })
    }
  })
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
    
    // Clean up user from room if they were in one
    if (socket.projectId && socket.userId) {
      const room = removeUserFromRoom(socket.projectId, socket.userId)
      
      // Notify others
      socket.to(socket.projectId).emit('user:leave', {
        projectId: socket.projectId,
        userId: socket.userId,
        userName: socket.userName || 'Unknown User'
      })
      
      console.log(`   Remaining users in ${socket.projectId}:`, room.length)
    }
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 Real-Time Collaboration Server Running!')
  console.log(`📡 WebSocket server: http://localhost:${PORT}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('Ready to accept connections from:')
  console.log('  - http://localhost:5173 (Vue dev server)')
  console.log('')
  console.log('Press Ctrl+C to stop the server')
  console.log('')
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

