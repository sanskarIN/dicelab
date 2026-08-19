import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractCargoPackageVersion,
  extractFrontendVersion,
  normalizeExpectedVersion,
  validateVersions,
} from './check-version-sync.mjs';

test('extracts frontend version metadata', () => {
  assert.equal(extractFrontendVersion("export const APP_VERSION = '1.2.3';\n"), '1.2.3');
});

test('extracts only the Cargo package version', () => {
  const cargo = `[package]\nname = "dicelab"\nversion = "1.2.3"\n\n[dependencies]\nexample = "9.9.9"\n`;
  assert.equal(extractCargoPackageVersion(cargo), '1.2.3');
});

test('accepts matching semantic versions including prerelease metadata', () => {
  const version = '1.2.3-rc.1+build.7';
  assert.equal(
    validateVersions([
      { source: 'a', version },
      { source: 'b', version },
      { source: 'c', version },
    ]),
    version,
  );
});

test('normalizes a conventional v-prefixed release tag', () => {
  assert.equal(normalizeExpectedVersion('v1.2.3'), '1.2.3');
  assert.equal(normalizeExpectedVersion('1.2.3'), '1.2.3');
  assert.equal(normalizeExpectedVersion(undefined), undefined);
});

test('accepts a release tag that matches the synchronized application version', () => {
  assert.equal(
    validateVersions(
      [
        { source: 'package.json', version: '1.2.3' },
        { source: 'tauri.conf.json', version: '1.2.3' },
      ],
      'v1.2.3',
    ),
    '1.2.3',
  );
});

test('rejects a release tag that does not match the application version', () => {
  assert.throws(
    () => validateVersions([{ source: 'package.json', version: '1.2.3' }], 'v1.2.4'),
    /Release tag\/version mismatch: tag=v1\.2\.4, application=1\.2\.3/,
  );
});

test('rejects an invalid expected release tag version', () => {
  assert.throws(
    () => validateVersions([{ source: 'package.json', version: '1.2.3' }], 'release-one'),
    /Expected release version is not valid SemVer/,
  );
});

test('rejects mismatched versions with source names', () => {
  assert.throws(
    () =>
      validateVersions([
        { source: 'package.json', version: '1.2.3' },
        { source: 'tauri.conf.json', version: '1.2.4' },
      ]),
    /package\.json=1\.2\.3, tauri\.conf\.json=1\.2\.4/,
  );
});

test('rejects invalid semantic version strings', () => {
  assert.throws(
    () => validateVersions([{ source: 'package.json', version: 'version-one' }]),
    /Invalid semantic version format/,
  );
});
