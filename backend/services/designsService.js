import crypto from 'crypto';

import { DEFAULT_DESIGNS } from '../data/designs.js';
import { readJson, writeJson } from './jsonFileService.js';

const FILE_NAME = 'designs.json';

function createNotFoundError(id) {
  const error = new Error(`Design ${id} not found`);
  error.status = 404;
  return error;
}

async function readAll() {
  return readJson(FILE_NAME, DEFAULT_DESIGNS);
}

async function saveAll(designs) {
  await writeJson(FILE_NAME, designs);
}

export async function listDesigns(templateId) {
  const designs = await readAll();
  if (!templateId) {
    return designs;
  }
  return designs.filter((design) => design.templateId === templateId);
}

export async function getDesign(id) {
  const designs = await readAll();
  const design = designs.find((item) => item.id === id);
  if (!design) {
    throw createNotFoundError(id);
  }
  return design;
}

export async function createDesign(payload) {
  const designs = await readAll();
  const now = new Date().toISOString();
  const design = {
    id: crypto.randomUUID(),
    title: payload.title,
    description: payload.description ?? '',
    templateId: payload.templateId ?? null,
    previewUrl: payload.previewUrl ?? null,
    tags: Array.isArray(payload.tags) ? [...payload.tags] : [],
    data: payload.data ?? {},
    createdAt: now,
    updatedAt: now,
  };

  designs.push(design);
  await saveAll(designs);
  return design;
}

export async function updateDesign(id, payload) {
  const designs = await readAll();
  const index = designs.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createNotFoundError(id);
  }

  const existing = designs[index];
  const updated = {
    ...existing,
    ...payload,
    tags: Array.isArray(payload.tags) ? [...payload.tags] : existing.tags,
    data: payload.data ?? existing.data,
    updatedAt: new Date().toISOString(),
  };

  designs[index] = updated;
  await saveAll(designs);
  return updated;
}

export async function deleteDesign(id) {
  const designs = await readAll();
  const index = designs.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createNotFoundError(id);
  }
  const [removed] = designs.splice(index, 1);
  await saveAll(designs);
  return removed;
}
