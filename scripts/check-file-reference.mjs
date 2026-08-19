import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, '..');
const REFERENCE_PATH = path.join(REPOSITORY_ROOT, 'docs/repository-file-reference.md');

export function parseDocumentedPaths(markdown) {
  const paths = new Set();
  const rowPattern = /^\|\s*`([^`]+)`\s*\|/gm;
  let match;
  while ((match = rowPattern.exec(markdown)) !== null) paths.add(match[1]);
  return paths;
}

export function auditFileReference(trackedFiles, documentedPaths) {
  const tracked = new Set(trackedFiles);
  const documented = documentedPaths instanceof Set ? documentedPaths : new Set(documentedPaths);
  const missing = [...tracked].filter((filepath) => !documented.has(filepath)).sort();
  const stale = [...documented].filter((filepath) => !tracked.has(filepath)).sort();
  return { missing, stale };
}

export async function listTrackedFiles(repositoryRoot = REPOSITORY_ROOT) {
  const { stdout } = await execFileAsync('git', ['ls-files', '-z'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  return stdout.split('\0').filter(Boolean).sort();
}

export async function auditRepositoryFileReference({
  repositoryRoot = REPOSITORY_ROOT,
  referencePath = REFERENCE_PATH,
} = {}) {
  const [trackedFiles, markdown] = await Promise.all([
    listTrackedFiles(repositoryRoot),
    readFile(referencePath, 'utf8'),
  ]);
  return auditFileReference(trackedFiles, parseDocumentedPaths(markdown));
}

async function main() {
  let result;
  try {
    result = await auditRepositoryFileReference();
  } catch (error) {
    console.error('Repository file reference audit could not run.');
    console.error(error instanceof Error ? error.message : 'Unknown audit failure.');
    process.exitCode = 1;
    return;
  }

  if (result.missing.length === 0 && result.stale.length === 0) {
    console.log('Repository file reference covers every tracked file exactly once or more.');
    return;
  }

  console.error('Repository file reference is out of sync.');
  if (result.missing.length) {
    console.error('Missing tracked files:');
    for (const filepath of result.missing) console.error(`- ${filepath}`);
  }
  if (result.stale.length) {
    console.error('Documented paths that are no longer tracked:');
    for (const filepath of result.stale) console.error(`- ${filepath}`);
  }
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
