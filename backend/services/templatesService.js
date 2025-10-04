import crypto from 'crypto';

import { DEFAULT_TEMPLATES } from '../data/templates.js';
import { readJson, writeJson } from './jsonFileService.js';

const FILE_NAME = 'templates.json';

function createNotFoundError(id) {
  const error = new Error(`Template ${id} not found`);
  error.status = 404;
  return error;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function readAll() {
  return readJson(FILE_NAME, DEFAULT_TEMPLATES);
}

async function saveAll(templates) {
  await writeJson(FILE_NAME, templates);
}

export async function listTemplates(category) {
  const templates = await readAll();
  if (!category) {
    return templates;
  }
  return templates.filter((template) => template.category === category);
}

export async function listCategories() {
  const templates = await readAll();
  const categories = new Map();

  templates.forEach((template) => {
    const count = categories.get(template.category) ?? 0;
    categories.set(template.category, count + 1);
  });

  return Array.from(categories.entries()).map(([id, count]) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    count,
  }));
}

export async function getTemplate(id) {
  const templates = await readAll();
  const template = templates.find((item) => item.id === id);
  if (!template) {
    throw createNotFoundError(id);
  }
  return template;
}

function normaliseElements(elements) {
  if (!Array.isArray(elements)) {
    return [];
  }
  return elements.map((element) => ({ ...element }));
}

export async function createTemplate(payload) {
  const templates = await readAll();
  const now = new Date().toISOString();
  const id = payload.name
    ? `${slugify(payload.name)}-${crypto.randomUUID().slice(0, 6)}`
    : crypto.randomUUID();

  const template = {
    id,
    name: payload.name,
    category: payload.category,
    size: payload.size,
    thumbnail: payload.thumbnail,
    elements: normaliseElements(payload.elements),
    tags: payload.tags ?? [],
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };

  templates.push(template);
  await saveAll(templates);
  return template;
}

export async function updateTemplate(id, payload) {
  const templates = await readAll();
  const index = templates.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createNotFoundError(id);
  }

  const existing = templates[index];
  const updated = {
    ...existing,
    ...payload,
    size: payload.size ?? existing.size,
    elements: Array.isArray(payload.elements)
      ? normaliseElements(payload.elements)
      : existing.elements,
    tags: payload.tags ?? existing.tags,
    updatedAt: new Date().toISOString(),
  };

  templates[index] = updated;
  await saveAll(templates);
  return updated;
}

export async function deleteTemplate(id) {
  const templates = await readAll();
  const index = templates.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createNotFoundError(id);
  }
  const [removed] = templates.splice(index, 1);
  await saveAll(templates);
  return removed;
}