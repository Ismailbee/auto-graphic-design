import crypto from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

import { DEFAULT_ASSETS } from '../data/assets.js';
import { ensureDirectoryExists, readJson, writeJson } from './jsonFileService.js';

const MANIFEST_FILE = 'assets-manifest.json';
const ASSETS_DIR = path.join(process.cwd(), 'storage', 'assets');

function createNotFoundError(id) {
  const error = new Error(`Asset ${id} not found`);
  error.status = 404;
  return error;
}

async function readManifest() {
  return readJson(MANIFEST_FILE, DEFAULT_ASSETS);
}

async function saveManifest(manifest) {
  await writeJson(MANIFEST_FILE, manifest);
}

export async function listAssets(tag) {
  const assets = await readManifest();
  if (!tag) {
    return assets;
  }
  return assets.filter((asset) => asset.tags?.includes(tag));
}

export async function getAsset(id) {
  const assets = await readManifest();
  const asset = assets.find((item) => item.id === id);
  if (!asset) {
    throw createNotFoundError(id);
  }
  return asset;
}

export async function uploadAsset(file) {
  if (!file) {
    const error = new Error('No file provided');
    error.status = 400;
    throw error;
  }

  const extension = path.extname(file.originalname) || '.bin';
  const id = crypto.randomUUID();
  const fileName = `${id}${extension}`;
  const targetPath = path.join(ASSETS_DIR, fileName);

  await ensureDirectoryExists(targetPath);
  await writeFile(targetPath, file.buffer);

  const asset = {
    id,
    originalName: file.originalname,
    fileName,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/${fileName}`,
    tags: [],
    createdAt: new Date().toISOString(),
  };

  const manifest = await readManifest();
  manifest.push(asset);
  await saveManifest(manifest);
  return asset;
}

export async function updateAsset(id, payload) {
  const manifest = await readManifest();
  const index = manifest.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createNotFoundError(id);
  }

  const existing = manifest[index];
  const updated = {
    ...existing,
    tags: Array.isArray(payload.tags) ? [...payload.tags] : existing.tags,
  };

  manifest[index] = updated;
  await saveManifest(manifest);
  return updated;
}

export async function deleteAsset(id) {
  const manifest = await readManifest();
  const index = manifest.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createNotFoundError(id);
  }

  const [removed] = manifest.splice(index, 1);
  await saveManifest(manifest);

  const targetPath = path.join(ASSETS_DIR, removed.fileName);
  try {
    await unlink(targetPath);
  } catch (error) {
    console.warn(`[assetsService] Failed to delete file ${targetPath}:`, error.message);
  }

  return removed;
}
