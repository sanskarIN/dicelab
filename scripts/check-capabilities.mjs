import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CAPABILITIES_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '../src-tauri/capabilities');

const FORBIDDEN_PERMISSION_PREFIXES = Object.freeze([
  'fs:',
  'shell:',
  'http:',
  'process:',
]);

export function auditCapabilityDocument(document, source = '<capability>') {
  const findings = [];

  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    return [`${source}: capability root must be an object`];
  }

  if ('remote' in document) {
    findings.push(`${source}: remote-origin capability access is not allowed`);
  }

  const windows = document.windows;
  if (!Array.isArray(windows) || windows.length === 0) {
    findings.push(`${source}: capability must target at least one explicit window`);
  } else if (windows.some((windowLabel) => typeof windowLabel !== 'string' || windowLabel === '*' || windowLabel.includes('*'))) {
    findings.push(`${source}: wildcard or invalid window capability target is not allowed`);
  }

  const permissions = document.permissions;
  if (!Array.isArray(permissions)) {
    findings.push(`${source}: permissions must be an array`);
    return findings;
  }

  for (const permission of permissions) {
    const identifier = permissionIdentifier(permission);
    if (identifier === null) {
      findings.push(`${source}: permission entries must be strings or scoped permission objects`);
      continue;
    }

    if (FORBIDDEN_PERMISSION_PREFIXES.some((prefix) => identifier.startsWith(prefix))) {
      findings.push(`${source}: broad permission family is not allowed: ${identifier}`);
    }
  }

  return findings;
}

export async function auditCapabilities(directory = DEFAULT_CAPABILITIES_DIRECTORY) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort();

  if (files.length === 0) {
    return [`${directory}: no capability JSON files found`];
  }

  const findings = [];
  for (const filename of files) {
    const filepath = path.join(directory, filename);
    let document;
    try {
      document = JSON.parse(await readFile(filepath, 'utf8'));
    } catch {
      findings.push(`${filename}: capability file is not valid JSON`);
      continue;
    }
    findings.push(...auditCapabilityDocument(document, filename));
  }
  return findings;
}

function permissionIdentifier(permission) {
  if (typeof permission === 'string') return permission;
  if (!permission || typeof permission !== 'object' || Array.isArray(permission)) return null;
  return typeof permission.identifier === 'string' ? permission.identifier : null;
}

async function main() {
  const findings = await auditCapabilities();
  if (findings.length === 0) {
    console.log('Desktop capability policy audit passed.');
    return;
  }

  console.error('Desktop capability policy audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
