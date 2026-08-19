import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'target']);
const markdownFiles = walk(root).filter((file) => extname(file).toLowerCase() === '.md');
const failures = [];

for (const file of markdownFiles) {
  const source = readFileSync(file, 'utf8');
  const links = source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g);
  for (const match of links) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, '');
    const targetWithoutTitle = rawTarget.split(/\s+["']/u, 1)[0];
    if (!targetWithoutTitle || targetWithoutTitle.startsWith('#') || isExternal(targetWithoutTitle)) continue;

    const pathPart = targetWithoutTitle.split('#', 1)[0].split('?', 1)[0];
    if (!pathPart) continue;

    let decoded = pathPart;
    try {
      decoded = decodeURIComponent(pathPart);
    } catch {
      failures.push(`${relative(root, file)}: malformed URL encoding in ${rawTarget}`);
      continue;
    }

    const target = decoded.startsWith('/') ? resolve(root, `.${decoded}`) : resolve(dirname(file), decoded);
    if (!existsSync(target)) {
      failures.push(`${relative(root, file)}: missing target ${rawTarget}`);
    }
  }
}

if (failures.length) {
  console.error('Documentation link check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Documentation link check passed for ${markdownFiles.length} Markdown files.`);
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
