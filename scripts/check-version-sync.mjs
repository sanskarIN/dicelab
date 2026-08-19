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
  const packageSection = /^\[package\]\s*$([\s\S]*?)(?=^\[|(?![\s\S]))/m.exec(source)?.[1];
  if (!packageSection) throw new Error('Could not find [package] in src-tauri/Cargo.toml.');
  const match = /^version\s*=\s*['"]([^'"]+)['"]\s*$/m.exec(packageSection);
  if (!match) throw new Error('Could not find package version in src-tauri/Cargo.toml.');
  return match[1];
}

export function extractPackageLockVersions(source) {
  const lock = JSON.parse(source);
  const topLevel = String(lock.version ?? '');
  const rootPackage = String(lock.packages?.['']?.version ?? '');
  if (!topLevel) throw new Error('Could not find top-level version in package-lock.json.');
  if (!rootPackage) throw new Error('Could not find root package version in package-lock.json.');
  return { topLevel, rootPackage };
}

export function extractCargoLockPackageVersion(source, packageName = 'dicelab') {
  const packageBlocks = source
    .split(/(?=^\[\[package\]\]\s*$)/m)
    .filter((block) => /^\[\[package\]\]\s*$/m.test(block));

  for (const block of packageBlocks) {
    const name = /^name\s*=\s*"([^"]+)"\s*$/m.exec(block)?.[1];
    if (name !== packageName) continue;
    const version = /^version\s*=\s*"([^"]+)"\s*$/m.exec(block)?.[1];
    if (!version) throw new Error(`Could not find ${packageName} version in src-tauri/Cargo.lock.`);
    return version;
  }
  throw new Error(`Could not find ${packageName} package in src-tauri/Cargo.lock.`);
}

export function normalizeExpectedVersion(value) {
  if (!value) return undefined;
  return value.startsWith('v') ? value.slice(1) : value;
}

export function validateVersions(entries, expectedVersion) {
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

  const normalizedExpected = normalizeExpectedVersion(expectedVersion);
  if (normalizedExpected) {
    if (!VERSION_PATTERN.test(normalizedExpected)) {
      throw new Error(`Expected release version is not valid SemVer: ${expectedVersion}.`);
    }
    if (expected !== normalizedExpected) {
      throw new Error(`Release tag/version mismatch: tag=${expectedVersion}, application=${expected}.`);
    }
  }

  return expected;
}

export async function readRepositoryVersions(root = ROOT) {
  const [packageJsonText, packageLockText, frontendText, cargoText, cargoLockText, tauriText] = await Promise.all([
    fs.readFile(path.join(root, 'package.json'), 'utf8'),
    fs.readFile(path.join(root, 'package-lock.json'), 'utf8'),
    fs.readFile(path.join(root, 'src/config/app.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src-tauri/Cargo.toml'), 'utf8'),
    fs.readFile(path.join(root, 'src-tauri/Cargo.lock'), 'utf8'),
    fs.readFile(path.join(root, 'src-tauri/tauri.conf.json'), 'utf8'),
  ]);

  const packageJson = JSON.parse(packageJsonText);
  const packageLockVersions = extractPackageLockVersions(packageLockText);
  const tauri = JSON.parse(tauriText);
  return [
    { source: 'package.json', version: String(packageJson.version ?? '') },
    { source: 'package-lock.json', version: packageLockVersions.topLevel },
    { source: 'package-lock.json packages[""]', version: packageLockVersions.rootPackage },
    { source: 'src/config/app.ts', version: extractFrontendVersion(frontendText) },
    { source: 'src-tauri/Cargo.toml', version: extractCargoPackageVersion(cargoText) },
    { source: 'src-tauri/Cargo.lock', version: extractCargoLockPackageVersion(cargoLockText) },
    { source: 'src-tauri/tauri.conf.json', version: String(tauri.version ?? '') },
  ];
}

async function main() {
  const entries = await readRepositoryVersions();
  const expectedVersion = process.env.DICELAB_EXPECT_VERSION || undefined;
  const version = validateVersions(entries, expectedVersion);
  console.log(
    expectedVersion
      ? `Version sync passed: ${version} matches ${expectedVersion}, including generated lock metadata.`
      : `Version sync passed: ${version}, including generated lock metadata.`,
  );
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
