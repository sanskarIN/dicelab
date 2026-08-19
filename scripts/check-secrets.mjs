import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const MAX_FILE_BYTES = 2_000_000;
const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'coverage', 'target']);
const ALLOWED_ENV_FILES = new Set(['.env.example', '.env.sample', '.env.template']);

const RULES = [
  { id: 'private-key', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
  { id: 'github-classic-token', pattern: /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/g },
  { id: 'github-fine-grained-token', pattern: /\bgithub_pat_[A-Za-z0-9_]{20,255}\b/g },
  { id: 'aws-access-key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { id: 'google-api-key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: 'slack-token', pattern: /\bxox[baprs]-[0-9A-Za-z-]{10,255}\b/g },
  { id: 'stripe-live-secret', pattern: /\bsk_live_[0-9A-Za-z]{16,255}\b/g },
];

export async function scanRepository(root = ROOT) {
  const findings = [];
  await walk(root, root, findings);
  return findings.sort((a, b) =>
    a.file === b.file ? a.line - b.line || a.rule.localeCompare(b.rule) : a.file.localeCompare(b.file),
  );
}

export function scanText(text, relativePath = 'fixture.txt') {
  const findings = [];
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    for (const match of text.matchAll(rule.pattern)) {
      findings.push({
        file: relativePath,
        line: lineNumberAt(text, match.index ?? 0),
        rule: rule.id,
      });
    }
  }
  return findings;
}

async function walk(root, current, findings) {
  const entries = await fs.readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
    const absolute = path.join(current, entry.name);
    const relative = path.relative(root, absolute).replaceAll(path.sep, '/');

    if (entry.isDirectory()) {
      await walk(root, absolute, findings);
      continue;
    }
    if (!entry.isFile()) continue;

    const basename = path.basename(relative);
    if (basename.startsWith('.env') && !ALLOWED_ENV_FILES.has(basename)) {
      findings.push({ file: relative, line: 1, rule: 'tracked-env-file' });
    }

    let stat;
    try {
      stat = await fs.stat(absolute);
    } catch {
      continue;
    }
    if (stat.size > MAX_FILE_BYTES) continue;

    let buffer;
    try {
      buffer = await fs.readFile(absolute);
    } catch {
      continue;
    }
    if (looksBinary(buffer)) continue;

    findings.push(...scanText(buffer.toString('utf8'), relative));
  }
}

function looksBinary(buffer) {
  const sampleLength = Math.min(buffer.length, 8_192);
  for (let index = 0; index < sampleLength; index += 1) {
    if (buffer[index] === 0) return true;
  }
  return false;
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let position = 0; position < index; position += 1) {
    if (text.charCodeAt(position) === 10) line += 1;
  }
  return line;
}

async function main() {
  const findings = await scanRepository();
  if (findings.length === 0) {
    console.log('Secret audit passed: no high-confidence credential patterns found.');
    return;
  }

  console.error(`Secret audit failed with ${findings.length} finding(s).`);
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} [${finding.rule}]`);
  }
  console.error('Matched credential values are intentionally not printed. Remove or rotate any real secret before continuing.');
  process.exitCode = 1;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
