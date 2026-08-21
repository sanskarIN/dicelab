import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'target']);

export function extractDocumentationTargets(source) {
  const matches = [];
  const markdownPattern = /!?\[[^\]]*\]\(([^)]+)\)/gu;
  const htmlPattern = /<(?:a|img)\b[^>]*?\b(?:href|src)\s*=\s*(["'])(.*?)\1/giu;

  for (const match of source.matchAll(markdownPattern)) {
    const rawTarget = match[1].trim().replace(/^<|>$/gu, '');
    const target = rawTarget.split(/\s+["']/u, 1)[0];
    if (target) matches.push({ index: match.index ?? 0, target });
  }

  for (const match of source.matchAll(htmlPattern)) {
    const target = match[2].trim();
    if (target) matches.push({ index: match.index ?? 0, target });
  }

  return matches.sort((left, right) => left.index - right.index).map(({ target }) => target);
}

export function markdownContainsAnchor(source, requestedAnchor) {
  const anchor = decodeFragment(requestedAnchor);
  if (!anchor) return false;

  const explicitIds = new Set();
  const explicitIdPattern = /\bid\s*=\s*(["'])(.*?)\1/giu;
  for (const match of source.matchAll(explicitIdPattern)) explicitIds.add(match[2]);
  if (explicitIds.has(anchor)) return true;

  const counts = new Map();
  const headingPattern = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/gmu;
  for (const match of source.matchAll(headingPattern)) {
    const base = githubHeadingSlug(match[1]);
    if (!base) continue;
    const occurrence = counts.get(base) ?? 0;
    counts.set(base, occurrence + 1);
    const candidate = occurrence === 0 ? base : `${base}-${occurrence}`;
    if (candidate === anchor) return true;
  }

  return false;
}

export async function scanDocumentationLinks(root = process.cwd()) {
  const repositoryRoot = path.resolve(root);
  const markdownFiles = (await walk(repositoryRoot)).filter((file) => path.extname(file).toLowerCase() === '.md');
  const errors = [];

  for (const file of markdownFiles) {
    const source = await fs.readFile(file, 'utf8');
    for (const rawTarget of extractDocumentationTargets(source)) {
      if (!rawTarget || isExternal(rawTarget)) continue;

      const [targetBeforeFragment, rawFragment = ''] = splitOnce(rawTarget, '#');
      const pathPart = splitOnce(targetBeforeFragment, '?')[0];
      const relativeSource = toRepositoryPath(repositoryRoot, file);

      if (!pathPart) {
        if (rawFragment && !markdownContainsAnchor(source, rawFragment)) {
          errors.push(`${relativeSource} -> ${rawTarget} (missing anchor)`);
        }
        continue;
      }

      const decodedPath = decodePath(pathPart);
      const targetPath = decodedPath.startsWith('/')
        ? path.resolve(repositoryRoot, `.${decodedPath}`)
        : path.resolve(path.dirname(file), decodedPath);

      if (!(await exists(targetPath))) {
        errors.push(`${relativeSource} -> ${rawTarget} (missing)`);
        continue;
      }

      if (rawFragment && path.extname(targetPath).toLowerCase() === '.md') {
        const targetSource = await fs.readFile(targetPath, 'utf8');
        if (!markdownContainsAnchor(targetSource, rawFragment)) {
          errors.push(`${relativeSource} -> ${rawTarget} (missing anchor)`);
        }
      }
    }
  }

  errors.sort((left, right) => left.localeCompare(right));
  return {
    markdownFiles: markdownFiles.map((file) => toRepositoryPath(repositoryRoot, file)),
    errors,
  };
}

function githubHeadingSlug(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/gu, '')
    .replace(/[`*_~]/gu, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/gu, '-')
    .replace(/-+/gu, '-');
}

function decodeFragment(fragment) {
  try {
    return decodeURIComponent(fragment).trim();
  } catch {
    return fragment.trim();
  }
}

function decodePath(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function splitOnce(value, separator) {
  const index = value.indexOf(separator);
  return index === -1 ? [value] : [value.slice(0, index), value.slice(index + separator.length)];
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    else files.push(entryPath);
  }
  return files;
}

function isExternal(target) {
  return /^[a-z][a-z\d+.-]*:/iu.test(target) || target.startsWith('//');
}

function toRepositoryPath(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

async function main() {
  const result = await scanDocumentationLinks();
  if (result.errors.length > 0) {
    console.error('Documentation link check failed:');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Documentation link check passed for ${result.markdownFiles.length} Markdown files.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) await main();
