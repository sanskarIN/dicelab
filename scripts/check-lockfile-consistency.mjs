import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, '..');

const PACKAGE_JSON = path.join(REPOSITORY_ROOT, 'package.json');
const PACKAGE_LOCK = path.join(REPOSITORY_ROOT, 'package-lock.json');
const CARGO_TOML = path.join(REPOSITORY_ROOT, 'src-tauri/Cargo.toml');
const CARGO_LOCK = path.join(REPOSITORY_ROOT, 'src-tauri/Cargo.lock');

export function auditNpmLockConsistency(packageJson, packageLock) {
  const findings = [];
  const root = packageLock?.packages?.[''];
  if (!root || typeof root !== 'object') {
    return ['package-lock.json: root package metadata is missing'];
  }

  const manifestSections = ['dependencies', 'devDependencies', 'optionalDependencies'];
  for (const section of manifestSections) {
    const manifestDependencies = packageJson?.[section] ?? {};
    const lockedDependencies = root?.[section] ?? {};
    for (const [name, requested] of Object.entries(manifestDependencies)) {
      if (!(name in lockedDependencies)) {
        findings.push(`package-lock.json: ${section} is missing direct dependency ${name}`);
        continue;
      }
      if (lockedDependencies[name] !== requested) {
        findings.push(
          `package-lock.json: ${section}.${name} request does not match package.json (${lockedDependencies[name]} != ${requested})`,
        );
      }
    }
    for (const name of Object.keys(lockedDependencies)) {
      if (!(name in manifestDependencies)) {
        findings.push(`package-lock.json: ${section} contains stale direct dependency ${name}`);
      }
    }
  }
  return findings;
}

export function parseCargoDirectDependencies(tomlSource) {
  const dependencies = new Map();
  let section = '';

  for (const rawLine of tomlSource.split(/\r?\n/)) {
    const line = stripTomlComment(rawLine).trim();
    if (!line) continue;

    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }

    if (!isDependencySection(section)) continue;
    const assignment = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
    if (!assignment) continue;

    const alias = assignment[1];
    const value = assignment[2].trim();
    const packageMatch = value.match(/\bpackage\s*=\s*["']([^"']+)["']/);
    dependencies.set(alias, packageMatch?.[1] ?? alias);
  }

  return dependencies;
}

export function parseCargoLockPackageNames(lockSource) {
  const names = new Set();
  const packageBlocks = lockSource.split(/\n\[\[package\]\]\s*\n/);
  for (const block of packageBlocks) {
    const nameMatch = block.match(/^name\s*=\s*["']([^"']+)["']/m);
    if (nameMatch) names.add(nameMatch[1]);
  }
  return names;
}

export function auditCargoLockConsistency(tomlSource, lockSource) {
  const direct = parseCargoDirectDependencies(tomlSource);
  const locked = parseCargoLockPackageNames(lockSource);
  const findings = [];

  for (const [alias, packageName] of direct) {
    if (!locked.has(packageName)) {
      const aliasNote = alias === packageName ? '' : ` (manifest alias ${alias})`;
      findings.push(`src-tauri/Cargo.lock: missing direct Cargo dependency ${packageName}${aliasNote}`);
    }
  }
  return findings;
}

export async function auditLockfileConsistency() {
  const [packageJsonSource, packageLockSource, cargoToml, cargoLock] = await Promise.all([
    readFile(PACKAGE_JSON, 'utf8'),
    readFile(PACKAGE_LOCK, 'utf8'),
    readFile(CARGO_TOML, 'utf8'),
    readFile(CARGO_LOCK, 'utf8'),
  ]);

  let packageJson;
  let packageLock;
  try {
    packageJson = JSON.parse(packageJsonSource);
  } catch {
    return ['package.json: invalid JSON'];
  }
  try {
    packageLock = JSON.parse(packageLockSource);
  } catch {
    return ['package-lock.json: invalid JSON'];
  }

  return [
    ...auditNpmLockConsistency(packageJson, packageLock),
    ...auditCargoLockConsistency(cargoToml, cargoLock),
  ];
}

function isDependencySection(section) {
  return (
    section === 'dependencies' ||
    section === 'dev-dependencies' ||
    section === 'build-dependencies' ||
    /^target\..+\.(?:dependencies|dev-dependencies|build-dependencies)$/.test(section)
  );
}

function stripTomlComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if ((character === '"' || character === "'") && line[index - 1] !== '\\') {
      quote = quote === character ? null : quote ?? character;
      continue;
    }
    if (character === '#' && quote === null) return line.slice(0, index);
  }
  return line;
}

async function main() {
  const findings = await auditLockfileConsistency();
  if (findings.length === 0) {
    console.log('Dependency lock consistency audit passed.');
    return;
  }

  console.error('Dependency lock consistency audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  console.error('Regenerate lockfiles with the package managers; do not hand-edit transitive lock entries.');
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
