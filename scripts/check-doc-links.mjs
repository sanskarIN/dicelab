import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'target']);

export function extractDocumentationTargets(source) {
  const targets = [];
  const markdownLinks = source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/gu);
  for (const match of markdownLinks) {
    const target = normalizeMarkdownTarget(match[1]);
    if (target) targets.push(target);
  }

  const htmlLinks = source.matchAll(/<(?:a|img)\b[^>]*?\b(?:href|src)\s*=\s*(["'])(.*?)\1[^>]*>/giu);
  for (const match of htmlLinks) {
    const target = match[2].trim();
    if (target) targets.push(target);
  }

  return targets;
}

export function markdownContainsAnchor(source, requestedAnchor) {
  const normalizedRequested = decodeFragment(requestedAnchor);
  if (!normalizedRequested) return false;

  const explicitIds = source.matchAll(/\bid\s*=\s*(["'])(.*?)\1/giu);
  for (const match of explicitIds) {
    if (match[2] === normalizedRequested) return true;
  }

  const headingCounts = new Map();
  for (const line of source.split(/\r?\n/u)) {
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/u.exec(line);
    if (!match) continue;

    const baseSlug = githubHeadingSlug(match[2]);
    if (!baseSlug) continue;
    const duplicateIndex = headingCounts.get(baseSlug) ?? 0;
    headingCounts.set(baseSlug, duplicateIndex + 1);
    const slug = duplicateIndex === 0 ? baseSlug : `${baseSlug}-${duplicateIndex}`;
    if (slug === normalizedRequested) return true;
  }

  return false;
}

export async function scanDocumentationLinks(rootDirectory = process.cwd()) {
  const root = resolve(rootDirectory);
  const markdownFiles = walk(root).filter((file) => extname(file).toLowerCase() === '.md').sort();
  const errors = [];

  for (const file of markdownFiles) {
    const source = readFileSync(file, 'utf8');
    for (const rawTarget of extractDocumentationTargets(source)) {
      if (!rawTarget || isExternal(rawTarget)) continue;

      const [rawPathPart, rawFragment] = splitTarget(rawTarget);
      let decodedPath;
      try {
        decodedPath = decodeURIComponent(rawPathPart);
      } catch {
        errors.push(formatError(root, file, rawTarget, 'missing'));
        continue;
      }

      const target = decodedPath
        ? decodedPath.startsWith('/')
          ? resolve(root, `.${decodedPath}`)
          : resolve(dirname(file), decodedPath)
        : file;

      if (!existsSync(target)) {
        errors.push(formatError(root, file, rawTarget, 'missing'));
        continue;
      }

      if (rawFragment && isMarkdownFile(target)) {
        const targetSource = readFileSync(target, 'utf8');
        if (!markdownContainsAnchor(targetSource, rawFragment)) {
          errors.push(formatError(root, file, rawTarget, 'missing anchor'));
        }
      }
    }
  }

  errors.sort();
  return { markdownFiles, errors };
}

function normalizeMarkdownTarget(rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/gu, '');
  if (!target) return '';

  const titleMatch = /^(.*?)(?:\s+["'][^"']*["'])\s*$/u.exec(target);
  return (titleMatch?.[1] ?? target).trim();
}

function splitTarget(target) {
  const withoutQuery = target.split('?', 1)[0];
  const hashIndex = withoutQuery.indexOf('#');
  if (hashIndex === -1) return [withoutQuery, ''];
  return [withoutQuery.slice(0, hashIndex), withoutQuery.slice(hashIndex + 1)];
}

function decodeFragment(fragment) {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

function githubHeadingSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/gu, '')
    .replace(/[\p{P}\p{S}&&[^-_]]/gu, '')
    .replace(/\s+/gu, '-');
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function isExternal(target) {
  return /^[a-z][a-z\d+.-]*:/iu.test(target) || target.startsWith('//');
}

function isMarkdownFile(path) {
  try {
    return statSync(path).isFile() && extname(path).toLowerCase() === '.md';
  } catch {
    return false;
  }
}

function formatError(root, sourceFile, target, reason) {
  return `${relative(root, sourceFile)} -> ${target} (${reason})`;
}

async function main() {
  const { markdownFiles, errors } = await scanDocumentationLinks(process.cwd());
  if (errors.length) {
    console.error('Documentation link check failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`Documentation link check passed for ${markdownFiles.length} Markdown files.`);
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  await main();
}
