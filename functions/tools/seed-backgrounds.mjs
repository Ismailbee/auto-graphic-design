import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import admin from 'firebase-admin';

const PALETTE_KEYS = new Set(['light', 'dark', 'redGold']);

function parseArgs(argv) {
  const args = {
    input: null,
    collection: 'backgrounds',
    projectId: null,
    dryRun: false,
    serviceAccount: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--help' || token === '-h') {
      args.help = true;
      return args;
    }

    if (token === '--in') {
      args.input = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--collection') {
      args.collection = argv[i + 1] || args.collection;
      i += 1;
      continue;
    }

    if (token === '--projectId') {
      args.projectId = argv[i + 1] || null;
      i += 1;
      continue;
    }

    if (token === '--serviceAccount') {
      args.serviceAccount = argv[i + 1] || null;
      i += 1;
      continue;
    }

    if (token === '--dryRun') {
      args.dryRun = true;
      continue;
    }

    throw new Error(`Unknown arg: ${token}`);
  }

  return args;
}

function printHelp() {
  // Keep this short: it will be copy/pasted into terminals.
  console.log(`\nSeed Firestore backgrounds\n\nUsage:\n  node tools/seed-backgrounds.mjs --in <file.json> [--collection backgrounds] [--projectId <id>] [--serviceAccount <path.json>] [--dryRun]\n\nInput JSON format (array):\n  { id, name, url, paletteKey?: light|dark|redGold, weight?: number, category?: string }\n\nAuth options:\n  - Recommended: set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON\n  - Or pass --serviceAccount <path.json>\n`);
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Item must be an object');

  const id = String(raw.id || '').trim();
  const name = String(raw.name || '').trim();
  const url = String(raw.url || raw.fullUrl || '').trim();

  if (!id) throw new Error('Item.id is required');
  if (!name) throw new Error(`Item.name is required (id=${id})`);
  if (!url) throw new Error(`Item.url is required (id=${id})`);

  const paletteKeyRaw = raw.paletteKey == null ? null : String(raw.paletteKey).trim();
  const paletteKey = paletteKeyRaw && PALETTE_KEYS.has(paletteKeyRaw) ? paletteKeyRaw : null;

  const weightNum = raw.weight == null ? null : Number(raw.weight);
  const weight = Number.isFinite(weightNum) && weightNum > 0 ? weightNum : null;

  const category = raw.category == null ? null : String(raw.category).trim();

  return {
    id,
    doc: {
      name,
      url,
      ...(paletteKey ? { paletteKey } : {}),
      ...(weight != null ? { weight } : {}),
      ...(category ? { category } : {}),
      source: 'remote',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  };
}

async function loadJsonArray(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  const buf = await fs.readFile(resolved);
  const parsed = JSON.parse(buf.toString('utf8'));
  if (!Array.isArray(parsed)) throw new Error('Input JSON must be an array');
  return parsed;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.input) {
    printHelp();
    throw new Error('Missing --in <file.json>');
  }

  if (!admin.apps.length) {
    if (args.serviceAccount) {
      const resolved = path.resolve(process.cwd(), args.serviceAccount);
      const json = JSON.parse(await fs.readFile(resolved, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(json),
        ...(args.projectId ? { projectId: args.projectId } : {}),
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        ...(args.projectId ? { projectId: args.projectId } : {}),
      });
    }
  }

  const rawItems = await loadJsonArray(args.input);
  const items = rawItems.map(normalizeItem);

  const db = admin.firestore();
  const col = db.collection(args.collection);

  console.log(`Preparing ${items.length} backgrounds -> collection "${args.collection}"${args.dryRun ? ' (dryRun)' : ''}`);

  let batch = db.batch();
  let batchCount = 0;
  let written = 0;

  const commitBatch = async () => {
    if (batchCount === 0) return;
    if (args.dryRun) {
      written += batchCount;
      batch = db.batch();
      batchCount = 0;
      return;
    }
    await batch.commit();
    written += batchCount;
    batch = db.batch();
    batchCount = 0;
  };

  for (const item of items) {
    const ref = col.doc(item.id);
    batch.set(ref, item.doc, { merge: true });
    batchCount += 1;

    // Firestore batch limit is 500.
    if (batchCount >= 450) {
      await commitBatch();
    }
  }

  await commitBatch();
  console.log(`Done. Upserted ${written} background docs.`);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exitCode = 1;
});
