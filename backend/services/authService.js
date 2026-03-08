import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { readJson, writeJson } from './jsonFileService.js';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'storage', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

/**
 * Register a new user
 */
export async function register(userData) {
  const users = await readJson(USERS_FILE);
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.status = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create new user
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: userData.email,
    name: userData.name || '',
    password: hashedPassword,
    role: userData.role || 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    avatar: userData.avatar || null,
    preferences: {
      theme: 'light',
      notifications: true
    }
  };

  users.push(newUser);
  await writeJson(USERS_FILE, users);

  // Generate tokens
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  // Return user without password
  const { password, ...userWithoutPassword } = newUser;
  
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
}

/**
 * Login user
 */
export async function login(email, password) {
  const users = await readJson(USERS_FILE);
  
  // Find user by email
  const user = users.find(u => u.email === email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update last login
  user.lastLogin = new Date().toISOString();
  await writeJson(USERS_FILE, users);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const users = await readJson(USERS_FILE);
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const newAccessToken = generateAccessToken(user);
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: newAccessToken
    };
  } catch (error) {
    const authError = new Error('Invalid refresh token');
    authError.status = 401;
    throw authError;
  }
}

/**
 * Get current user by ID
 */
export async function getCurrentUser(userId) {
  const users = await readJson(USERS_FILE);
  const user = users.find(u => u.id === userId);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  const users = await readJson(USERS_FILE);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Don't allow updating sensitive fields
  delete updates.password;
  delete updates.id;
  delete updates.role;
  delete updates.createdAt;

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await writeJson(USERS_FILE, users);

  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
}

/**
 * Change password
 */
export async function changePassword(userId, currentPassword, newPassword) {
  const users = await readJson(USERS_FILE);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const user = users[userIndex];

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    const error = new Error('Current password is incorrect');
    error.status = 401;
    throw error;
  }

  // Hash and update new password
  user.password = await bcrypt.hash(newPassword, 10);
  user.updatedAt = new Date().toISOString();

  await writeJson(USERS_FILE, users);

  return { message: 'Password changed successfully' };
}

/**
 * Generate access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * Verify token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    const authError = new Error('Invalid token');
    authError.status = 401;
    throw authError;
  }
}
