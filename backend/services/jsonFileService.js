import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'storage');

export async function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  try {
    await access(dir, constants.F_OK);
  } catch (error) {
    await mkdir(dir, { recursive: true });
    console.info(`[jsonFileService] Created directory ${dir}`);
  }
}

export async function readJson(fileName, fallback) {
  const filePath = path.join(STORAGE_DIR, fileName);
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[jsonFileService] Using fallback for ${fileName}: ${error.message}`);
    if (fallback !== undefined) {
      await writeJson(fileName, fallback);
      return Array.isArray(fallback) ? [...fallback] : { ...fallback };
    }
    throw error;
  }
}

export async function writeJson(fileName, data) {
  const filePath = path.join(STORAGE_DIR, fileName);
  await ensureDirectoryExists(filePath);
  const payload = JSON.stringify(data, null, 2);
  await writeFile(filePath, payload, 'utf8');
}
