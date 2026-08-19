import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, '..');
const SOURCE_DIRECTORY = path.join(REPOSITORY_ROOT, 'src');
const RUST_ENTRY = path.join(REPOSITORY_ROOT, 'src-tauri/src/lib.rs');

const APPROVED_COMMANDS = Object.freeze({
  roll_expression: 'src/services/roll-service.ts',
  save_text_export: 'src/services/export.ts',
});

export function auditFrontendInvokeSource(source, filename) {
  const findings = [];
  const normalized = filename.replaceAll('\\', '/');
  const invocationPattern = /\binvoke(?:<[^;()]*>)?\s*\(\s*(['"])([^'"]+)\1/g;
  const genericInvokePattern = /\binvoke(?:<[^;()]*>)?\s*\(/g;

  const literalStarts = new Set();
  let match;
  while ((match = invocationPattern.exec(source)) !== null) {
    literalStarts.add(match.index);
    const command = match[2];
    const expectedFile = APPROVED_COMMANDS[command];
    if (!expectedFile) {
      findings.push(`${normalized}: frontend invokes unapproved native command: ${command}`);
    } else if (normalized !== expectedFile) {
      findings.push(`${normalized}: ${command} must be invoked only from ${expectedFile}`);
    }
  }

  while ((match = genericInvokePattern.exec(source)) !== null) {
    if (!literalStarts.has(match.index)) {
      findings.push(`${normalized}: native command name must be a static string literal`);
    }
  }

  return findings;
}

export function auditRustHandlerSource(source, filename = 'src-tauri/src/lib.rs') {
  const findings = [];
  const handlerMatch = source.match(/generate_handler!\s*\[([^\]]*)\]/s);
  if (!handlerMatch) {
    return [`${filename}: tauri::generate_handler! command list was not found`];
  }

  const commands = handlerMatch[1]
    .split(',')
    .map((command) => command.trim())
    .filter(Boolean)
    .map((command) => command.split('::').at(-1));
  const unique = new Set(commands);

  if (unique.size !== commands.length) {
    findings.push(`${filename}: native command handler contains duplicate entries`);
  }

  for (const command of commands) {
    if (!(command in APPROVED_COMMANDS)) {
      findings.push(`${filename}: native handler exposes unapproved command: ${command}`);
    }
  }

  for (const command of Object.keys(APPROVED_COMMANDS)) {
    if (!unique.has(command)) {
      findings.push(`${filename}: approved native command is missing from handler: ${command}`);
    }
  }

  return findings;
}

export async function auditNativeCommandContract() {
  const findings = [];
  const files = (await listProductionTypeScriptFiles(SOURCE_DIRECTORY)).sort();
  for (const filepath of files) {
    const relative = path.relative(REPOSITORY_ROOT, filepath).replaceAll(path.sep, '/');
    findings.push(...auditFrontendInvokeSource(await readFile(filepath, 'utf8'), relative));
  }
  findings.push(...auditRustHandlerSource(await readFile(RUST_ENTRY, 'utf8')));
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
  const findings = await auditNativeCommandContract();
  if (findings.length === 0) {
    console.log('Native command contract audit passed.');
    return;
  }

  console.error('Native command contract audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
