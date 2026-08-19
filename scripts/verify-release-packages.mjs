import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function parseChecksumFile(contents) {
  const entries = [];
  const seen = new Set();
  for (const [index, rawLine] of contents.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = /^([a-fA-F0-9]{64})\s+\*?(.+)$/.exec(line);
    if (!match) throw new Error(`Invalid checksum line ${index + 1}.`);
    const filename = match[2].trim();
    if (!isSafeRelativeFilename(filename)) throw new Error(`Unsafe checksum filename on line ${index + 1}.`);
    if (seen.has(filename)) throw new Error(`Duplicate checksum entry: ${filename}.`);
    seen.add(filename);
    entries.push({ filename, sha256: match[1].toLowerCase() });
  }
  if (entries.length === 0) throw new Error('SHA256SUMS.txt contains no checksum entries.');
  return entries;
}

export function validateReleaseMetadata(metadata, expected = {}) {
  if (!metadata || typeof metadata !== 'object') throw new Error('RELEASE-METADATA.json root must be an object.');
  if (metadata.schemaVersion !== 1) throw new Error('Unsupported release metadata schema version.');
  for (const key of ['project', 'repository', 'tag', 'sourceCommit', 'workflowRunId', 'workflowRunAttempt']) {
    if (typeof metadata[key] !== 'string' || metadata[key].trim() === '') {
      throw new Error(`Release metadata field ${key} is missing or invalid.`);
    }
  }
  if (metadata.project !== 'DiceLab') throw new Error(`Unexpected release project: ${metadata.project}.`);
  if (!/^[0-9a-f]{40}$/i.test(metadata.sourceCommit)) throw new Error('Release metadata sourceCommit must be a full Git SHA.');
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(metadata.tag)) {
    throw new Error(`Release metadata tag is not a supported DiceLab version tag: ${metadata.tag}.`);
  }
  if (expected.tag && metadata.tag !== expected.tag) {
    throw new Error(`Release metadata tag mismatch: expected ${expected.tag}, found ${metadata.tag}.`);
  }
  if (expected.sourceCommit && metadata.sourceCommit.toLowerCase() !== expected.sourceCommit.toLowerCase()) {
    throw new Error(
      `Release metadata source commit mismatch: expected ${expected.sourceCommit}, found ${metadata.sourceCommit}.`,
    );
  }
  return metadata;
}

export async function verifyReleaseDirectory(directory, expected = {}) {
  const root = path.resolve(directory);
  const checksumPath = path.join(root, 'SHA256SUMS.txt');
  const metadataPath = path.join(root, 'RELEASE-METADATA.json');
  const entries = parseChecksumFile(await fs.readFile(checksumPath, 'utf8'));

  if (!entries.some((entry) => entry.filename === 'RELEASE-METADATA.json')) {
    throw new Error('SHA256SUMS.txt must include RELEASE-METADATA.json.');
  }

  const results = [];
  for (const entry of entries) {
    const filePath = path.join(root, entry.filename);
    const stat = await fs.stat(filePath).catch(() => undefined);
    if (!stat?.isFile()) throw new Error(`Release file is missing: ${entry.filename}.`);
    const actual = await sha256File(filePath);
    if (actual !== entry.sha256) throw new Error(`SHA-256 mismatch for ${entry.filename}.`);
    results.push({ filename: entry.filename, sha256: actual, size: stat.size });
  }

  const metadata = validateReleaseMetadata(JSON.parse(await fs.readFile(metadataPath, 'utf8')), expected);
  return { metadata, files: results };
}

function isSafeRelativeFilename(filename) {
  if (!filename || path.isAbsolute(filename)) return false;
  if (filename.includes('/') || filename.includes('\\')) return false;
  if (filename === '.' || filename === '..' || filename.includes('\0')) return false;
  return path.basename(filename) === filename;
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function main() {
  const directory = process.argv[2] ?? '.';
  const expected = {
    tag: process.env.DICELAB_EXPECT_TAG || undefined,
    sourceCommit: process.env.DICELAB_EXPECT_COMMIT || undefined,
  };
  const result = await verifyReleaseDirectory(directory, expected);
  console.log(
    `Release verification passed for ${result.metadata.tag} at ${result.metadata.sourceCommit}: ${result.files.length} checked file(s).`,
  );
  for (const file of result.files) console.log(`${file.filename} ${file.size} bytes ${file.sha256}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
