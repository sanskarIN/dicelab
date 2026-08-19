import assert from 'node:assert/strict';
import test from 'node:test';
import {
  auditCargoLockConsistency,
  auditNpmLockConsistency,
  parseCargoDirectDependencies,
  parseCargoLockPackageNames,
} from './check-lockfile-consistency.mjs';

test('accepts matching direct npm dependency requests', () => {
  const manifest = {
    dependencies: { react: '^19.0.0' },
    devDependencies: { vite: '^7.0.0' },
  };
  const lock = {
    packages: {
      '': {
        dependencies: { react: '^19.0.0' },
        devDependencies: { vite: '^7.0.0' },
      },
    },
  };
  assert.deepEqual(auditNpmLockConsistency(manifest, lock), []);
});

test('reports missing, stale, and mismatched direct npm requests', () => {
  const manifest = {
    dependencies: { react: '^19.0.0', zod: '^4.0.0' },
    devDependencies: {},
  };
  const lock = {
    packages: {
      '': {
        dependencies: { react: '^18.0.0', stale: '^1.0.0' },
        devDependencies: {},
      },
    },
  };
  assert.deepEqual(auditNpmLockConsistency(manifest, lock), [
    'package-lock.json: dependencies.react request does not match package.json (^18.0.0 != ^19.0.0)',
    'package-lock.json: dependencies is missing direct dependency zod',
    'package-lock.json: dependencies contains stale direct dependency stale',
  ]);
});

test('parses Cargo dependency and build-dependency sections including package aliases', () => {
  const source = `
[dependencies]
tauri = { version = "2.8", features = [] }
renamed = { package = "real-crate", version = "1" }

[build-dependencies]
tauri-build = { version = "2.4" }

[target.'cfg(windows)'.dependencies]
windows = "0.61"

[package]
name = "not-a-dependency"
`;
  assert.deepEqual(
    [...parseCargoDirectDependencies(source).entries()],
    [
      ['tauri', 'tauri'],
      ['renamed', 'real-crate'],
      ['tauri-build', 'tauri-build'],
      ['windows', 'windows'],
    ],
  );
});

test('parses package names from Cargo.lock', () => {
  const lock = `
version = 4

[[package]]
name = "tauri"
version = "2.11.5"

[[package]]
name = "tauri-build"
version = "2.6.3"
`;
  assert.deepEqual([...parseCargoLockPackageNames(lock)].sort(), ['tauri', 'tauri-build']);
});

test('reports a direct Cargo dependency missing from the lockfile', () => {
  const manifest = `
[dependencies]
tauri = "2.8"
tauri-plugin-dialog = "2.7.2"
`;
  const lock = `
version = 4

[[package]]
name = "tauri"
version = "2.11.5"
`;
  assert.deepEqual(auditCargoLockConsistency(manifest, lock), [
    'src-tauri/Cargo.lock: missing direct Cargo dependency tauri-plugin-dialog',
  ]);
});

test('reports the package name for an aliased Cargo dependency', () => {
  const manifest = `
[dependencies]
dialog = { package = "tauri-plugin-dialog", version = "2.7.2" }
`;
  assert.deepEqual(auditCargoLockConsistency(manifest, 'version = 4\n'), [
    'src-tauri/Cargo.lock: missing direct Cargo dependency tauri-plugin-dialog (manifest alias dialog)',
  ]);
});
