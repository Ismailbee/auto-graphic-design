import { readJson, writeJson } from './jsonFileService.js';
import path from 'path';

const COMMENTS_FILE = path.join(process.cwd(), 'storage', 'comments.json');

/**
 * List all comments or filter by template/design ID
 */
export async function listComments(filters = {}) {
  const comments = await readJson(COMMENTS_FILE);
  
  let filtered = comments;

  if (filters.templateId) {
    filtered = filtered.filter(c => c.templateId === filters.templateId);
  }

  if (filters.designId) {
    filtered = filtered.filter(c => c.designId === filters.designId);
  }

  if (filters.userId) {
    filtered = filtered.filter(c => c.userId === filters.userId);
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return filtered;
}

/**
 * Get a single comment by ID
 */
export async function getComment(id) {
  const comments = await readJson(COMMENTS_FILE);
  const comment = comments.find(c => c.id === id);

  if (!comment) {
    const error = new Error('Comment not found');
    error.status = 404;
    throw error;
  }

  return comment;
}

/**
 * Create a new comment
 */
export async function createComment(commentData, userId) {
  const comments = await readJson(COMMENTS_FILE);

  const newComment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    templateId: commentData.templateId || null,
    designId: commentData.designId || null,
    text: commentData.text,
    rating: commentData.rating || null, // 1-5 stars
    parentId: commentData.parentId || null, // For replies
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEdited: false
  };

  comments.push(newComment);
  await writeJson(COMMENTS_FILE, comments);

  return newComment;
}

/**
 * Update a comment
 */
export async function updateComment(id, updates, userId) {
  const comments = await readJson(COMMENTS_FILE);
  const commentIndex = comments.findIndex(c => c.id === id);

  if (commentIndex === -1) {
    const error = new Error('Comment not found');
    error.status = 404;
    throw error;
  }

  const comment = comments[commentIndex];

  // Check ownership
  if (comment.userId !== userId) {
    const error = new Error('You can only edit your own comments');
    error.status = 403;
    throw error;
  }

  // Only allow updating text and rating
  const allowedUpdates = {
    text: updates.text || comment.text,
    rating: updates.rating !== undefined ? updates.rating : comment.rating,
    updatedAt: new Date().toISOString(),
    isEdited: true
  };

  comments[commentIndex] = {
    ...comment,
    ...allowedUpdates
  };

  await writeJson(COMMENTS_FILE, comments);

  return comments[commentIndex];
}

/**
 * Delete a comment
 */
export async function deleteComment(id, userId, userRole) {
  const comments = await readJson(COMMENTS_FILE);
  const commentIndex = comments.findIndex(c => c.id === id);

  if (commentIndex === -1) {
    const error = new Error('Comment not found');
    error.status = 404;
    throw error;
  }

  const comment = comments[commentIndex];

  // Check ownership or admin role
  if (comment.userId !== userId && userRole !== 'admin') {
    const error = new Error('You can only delete your own comments');
    error.status = 403;
    throw error;
  }

  const deleted = comments.splice(commentIndex, 1)[0];
  await writeJson(COMMENTS_FILE, comments);

  return deleted;
}

/**
 * Like/Unlike a comment
 */
export async function toggleCommentLike(id, userId) {
  const comments = await readJson(COMMENTS_FILE);
  const commentIndex = comments.findIndex(c => c.id === id);

  if (commentIndex === -1) {
    const error = new Error('Comment not found');
    error.status = 404;
    throw error;
  }

  const comment = comments[commentIndex];

  // Initialize likedBy array if it doesn't exist
  if (!comment.likedBy) {
    comment.likedBy = [];
  }

  const alreadyLiked = comment.likedBy.includes(userId);

  if (alreadyLiked) {
    // Unlike
    comment.likedBy = comment.likedBy.filter(id => id !== userId);
    comment.likes = Math.max(0, comment.likes - 1);
  } else {
    // Like
    comment.likedBy.push(userId);
    comment.likes += 1;
  }

  comments[commentIndex] = comment;
  await writeJson(COMMENTS_FILE, comments);

  return {
    ...comment,
    isLiked: !alreadyLiked
  };
}

/**
 * Get comment statistics for a template/design
 */
export async function getCommentStats(templateId = null, designId = null) {
  const comments = await readJson(COMMENTS_FILE);
  
  let filtered = comments;
  
  if (templateId) {
    filtered = filtered.filter(c => c.templateId === templateId);
  }
  
  if (designId) {
    filtered = filtered.filter(c => c.designId === designId);
  }

  const totalComments = filtered.length;
  const ratings = filtered.filter(c => c.rating !== null).map(c => c.rating);
  const averageRating = ratings.length > 0 
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
    : null;

  return {
    totalComments,
    totalRatings: ratings.length,
    averageRating: averageRating ? parseFloat(averageRating.toFixed(1)) : null,
    ratingDistribution: {
      5: ratings.filter(r => r === 5).length,
      4: ratings.filter(r => r === 4).length,
      3: ratings.filter(r => r === 3).length,
      2: ratings.filter(r => r === 2).length,
      1: ratings.filter(r => r === 1).length
    }
  };
}
