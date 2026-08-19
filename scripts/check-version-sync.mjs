import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function extractFrontendVersion(source) {
  const match = /export\s+const\s+APP_VERSION\s*=\s*['"]([^'"]+)['"]/.exec(source);
  if (!match) throw new Error('Could not find APP_VERSION in src/config/app.ts.');
  return match[1];
}

export function extractCargoPackageVersion(source) {
  const packageSection = /^\[package\]\s*$([\s\S]*?)(?=^\[|\Z)/m.exec(source)?.[1];
  if (!packageSection) throw new Error('Could not find [package] in src-tauri/Cargo.toml.');
  const match = /^version\s*=\s*['"]([^'"]+)['"]\s*$/m.exec(packageSection);
  if (!match) throw new Error('Could not find package version in src-tauri/Cargo.toml.');
  return match[1];
}

export function validateVersions(entries) {
  const invalid = entries.filter((entry) => !VERSION_PATTERN.test(entry.version));
  if (invalid.length) {
    throw new Error(`Invalid semantic version format in: ${invalid.map((entry) => entry.source).join(', ')}.`);
  }

  const expected = entries[0]?.version;
  const mismatched = entries.filter((entry) => entry.version !== expected);
  if (mismatched.length) {
    const values = entries.map((entry) => `${entry.source}=${entry.version}`).join(', ');
    throw new Error(`DiceLab version mismatch: ${values}`);
  }
  return expected;
}

export async function readRepositoryVersions(root = ROOT) {
  const [packageJsonText, frontendText, cargoText, tauriText] = await Promise.all([
    fs.readFile(path.join(root, 'package.json'), 'utf8'),
    fs.readFile(path.join(root, 'src/config/app.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src-tauri/Cargo.toml'), 'utf8'),
    fs.readFile(path.join(root, 'src-tauri/tauri.conf.json'), 'utf8'),
  ]);

  const packageJson = JSON.parse(packageJsonText);
  const tauri = JSON.parse(tauriText);
  return [
    { source: 'package.json', version: String(packageJson.version ?? '') },
    { source: 'src/config/app.ts', version: extractFrontendVersion(frontendText) },
    { source: 'src-tauri/Cargo.toml', version: extractCargoPackageVersion(cargoText) },
    { source: 'src-tauri/tauri.conf.json', version: String(tauri.version ?? '') },
  ];
}

async function main() {
  const entries = await readRepositoryVersions();
  const version = validateVersions(entries);
  console.log(`Version sync passed: ${version}.`);
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
