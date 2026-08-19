import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, '..');
const SOURCE_DIRECTORY = path.join(REPOSITORY_ROOT, 'src');

const APPROVED_TAURI_IMPORTS = new Set([
  'src/services/export.ts',
  'src/services/roll-service.ts',
]);

const APPROVED_RUNTIME_MARKERS = new Set([
  'src/services/runtime.ts',
]);

export function auditRuntimeBoundarySource(source, filename) {
  const findings = [];
  const normalized = filename.replaceAll('\\', '/');

  if (source.includes('@tauri-apps/api/core') && !APPROVED_TAURI_IMPORTS.has(normalized)) {
    findings.push(`${normalized}: direct Tauri core access is outside the approved service boundary`);
  }

  if (source.includes('__TAURI_INTERNALS__') && !APPROVED_RUNTIME_MARKERS.has(normalized)) {
    findings.push(`${normalized}: direct Tauri runtime probing must stay in src/services/runtime.ts`);
  }

  return findings;
}

export async function auditRuntimeBoundaries() {
  const files = (await listProductionTypeScriptFiles(SOURCE_DIRECTORY)).sort();
  const findings = [];
  for (const filepath of files) {
    const relative = path.relative(REPOSITORY_ROOT, filepath).replaceAll(path.sep, '/');
    const source = await readFile(filepath, 'utf8');
    findings.push(...auditRuntimeBoundarySource(source, relative));
  }
  return findings;
}

async function listProductionTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listProductionTypeScriptFiles(target)));
      continue;
    }
    if (!entry.isFile() || !/\.tsx?$/.test(entry.name)) continue;
    if (/\.(?:test|spec)\.tsx?$/.test(entry.name)) continue;
    files.push(target);
  }
  return files;
}

async function main() {
  const findings = await auditRuntimeBoundaries();
  if (findings.length === 0) {
    console.log('Native runtime boundary audit passed.');
    return;
  }

  console.error('Native runtime boundary audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
