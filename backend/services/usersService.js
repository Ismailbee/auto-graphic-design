import { DEFAULT_USERS } from '../data/users.js';
import { readJson, writeJson } from './jsonFileService.js';

const FILE_NAME = 'users.json';

function createNotFoundError(id) {
  const error = new Error(`User ${id} not found`);
  error.status = 404;
  return error;
}

async function readAll() {
  return readJson(FILE_NAME, DEFAULT_USERS);
}

async function saveAll(users) {
  await writeJson(FILE_NAME, users);
}

export async function listUsers() {
  return readAll();
}

export async function getUser(id) {
  const users = await readAll();
  const user = users.find((item) => item.id === id);
  if (!user) {
    throw createNotFoundError(id);
  }
  return user;
}

export async function updateUser(id, payload) {
  const users = await readAll();
  const index = users.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createNotFoundError(id);
  }

  const existing = users[index];
  const updated = {
    ...existing,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  users[index] = updated;
  await saveAll(users);
  return updated;
}
