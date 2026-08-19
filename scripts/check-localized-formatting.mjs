import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, '..');
const COMPONENTS_DIRECTORY = path.join(REPOSITORY_ROOT, 'src/components');
const APP_PATH = path.join(REPOSITORY_ROOT, 'src/App.tsx');

const FORBIDDEN_PATTERNS = Object.freeze([
  { id: 'to-locale-string', pattern: /\.toLocaleString\s*\(/g },
  { id: 'to-locale-date-string', pattern: /\.toLocaleDateString\s*\(/g },
  { id: 'to-locale-time-string', pattern: /\.toLocaleTimeString\s*\(/g },
  { id: 'intl-number-format', pattern: /\bnew\s+Intl\.NumberFormat\s*\(/g },
  { id: 'intl-date-time-format', pattern: /\bnew\s+Intl\.DateTimeFormat\s*\(/g },
]);

export function auditLocalizedFormattingSource(source, filename = '<source>') {
  const findings = [];
  for (const rule of FORBIDDEN_PATTERNS) {
    rule.pattern.lastIndex = 0;
    let match;
    while ((match = rule.pattern.exec(source)) !== null) {
      const line = source.slice(0, match.index).split('\n').length;
      findings.push(`${filename}:${line}: ${rule.id}`);
    }
  }
  return findings;
}

export async function auditLocalizedFormatting() {
  const files = [APP_PATH, ...(await listTypeScriptFiles(COMPONENTS_DIRECTORY))].sort();
  const findings = [];
  for (const filepath of files) {
    const source = await readFile(filepath, 'utf8');
    const relative = path.relative(REPOSITORY_ROOT, filepath).replaceAll(path.sep, '/');
    findings.push(...auditLocalizedFormattingSource(source, relative));
  }
  return findings;
}

async function listTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTypeScriptFiles(target)));
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      files.push(target);
    }
  }
  return files;
}

async function main() {
  const findings = await auditLocalizedFormatting();
  if (findings.length === 0) {
    console.log('Localized formatting boundary audit passed.');
    return;
  }

  console.error('Localized formatting boundary audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  console.error('Use src/i18n/format.ts for locale-sensitive UI values.');
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
