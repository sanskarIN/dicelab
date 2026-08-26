import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractCargoLockPackageVersion,
  extractCargoPackageVersion,
  extractFrontendVersion,
  extractPackageLockVersions,
  normalizeExpectedVersion,
  validateReleaseDocumentIdentity,
  validateVersions,
} from './check-version-sync.mjs';

test('extracts frontend version metadata', () => {
  assert.equal(extractFrontendVersion("export const APP_VERSION = '1.2.3';\n"), '1.2.3');
});

test('extracts only the Cargo package version', () => {
  const cargo = `[package]\nname = "dicelab"\nversion = "1.2.3"\n\n[dependencies]\nexample = "9.9.9"\n`;
  assert.equal(extractCargoPackageVersion(cargo), '1.2.3');
});

test('extracts Cargo package version when package is the final section', () => {
  const cargo = `[workspace]\nmembers = []\n\n[package]\nname = "dicelab"\nversion = "2.0.12"\n`;
  assert.equal(extractCargoPackageVersion(cargo), '2.0.12');
});

test('extracts both npm lockfile version locations', () => {
  const lock = JSON.stringify({
    name: 'dicelab',
    version: '2.0.12',
    lockfileVersion: 3,
    packages: { '': { name: 'dicelab', version: '2.0.12' } },
  });
  assert.deepEqual(extractPackageLockVersions(lock), {
    topLevel: '2.0.12',
    rootPackage: '2.0.12',
  });
});

test('rejects npm lockfiles missing the root package version', () => {
  assert.throws(
    () => extractPackageLockVersions('{"name":"dicelab","version":"2.0.12","packages":{"":{}}}'),
    /Could not find root package version in package-lock\.json/,
  );
});

test('extracts the DiceLab package version from Cargo.lock', () => {
  const lock = `# generated\nversion = 4\n\n[[package]]\nname = "alpha"\nversion = "9.9.9"\n\n[[package]]\nname = "dicelab"\nversion = "2.0.12"\ndependencies = [\n "alpha",\n]\n\n[[package]]\nname = "omega"\nversion = "1.0.0"\n`;
  assert.equal(extractCargoLockPackageVersion(lock), '2.0.12');
});

test('rejects Cargo locks without the application package', () => {
  const lock = `version = 4\n\n[[package]]\nname = "other"\nversion = "1.0.0"\n`;
  assert.throws(() => extractCargoLockPackageVersion(lock), /Could not find dicelab package/);
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
        { source: 'package.json', version: '2.0.12' },
        { source: 'package-lock.json', version: '0.1.0' },
        { source: 'src-tauri/Cargo.lock', version: '2.0.12' },
      ]),
    /package\.json=2\.0\.12, package-lock\.json=0\.1\.0, src-tauri\/Cargo\.lock=2\.0\.12/,
  );
});

test('rejects invalid semantic version strings', () => {
  assert.throws(
    () => validateVersions([{ source: 'package.json', version: 'version-one' }]),
    /Invalid semantic version format/,
  );
});

function releaseDocuments(version = '2.18.12') {
  return {
    readme: `The repository is preparing **DiceLab ${version}** with intended tag \`v${version}\`.`,
    roadmap: `Current release-preparation target: **${version}** (\`v${version}\`).`,
    changelog: `The next publication target is **${version}**.\n\n## [${version}] - candidate`,
    releaseGuide: `The repository is currently preparing **DiceLab ${version}**. Tag: v${version}`,
    releaseBlockers: `Current candidate: **${version}** (\`v${version}\`)`,
    releaseEvidence: [
      `expected identity is version \`${version}\` / tag \`v${version}\``,
      `- Version: ${version}`,
      `- Tag: v${version}`,
      `DICELAB_EXPECT_VERSION=v${version} npm run version:check`,
      `\`RELEASE-METADATA.json\` reports tag \`v${version}\``,
    ].join('\n'),
    lockfilePolicy: `Current release-preparation target: **${version}**.`,
    handoff: `Current release-preparation target: **${version}** (\`v${version}\`)`,
  };
}

test('accepts synchronized release-document candidate identity', () => {
  assert.doesNotThrow(() => validateReleaseDocumentIdentity('2.18.12', releaseDocuments()));
});

test('rejects a stale README release identity', () => {
  const documents = releaseDocuments();
  documents.readme = 'The repository is preparing **DiceLab 2.0.12** with intended tag `v2.0.12`.';
  assert.throws(
    () => validateReleaseDocumentIdentity('2.18.12', documents),
    /Release document identity mismatch: README\.md/,
  );
});

test('rejects a stale release evidence tag identity', () => {
  const documents = releaseDocuments();
  documents.releaseEvidence = documents.releaseEvidence.replace('v2.18.12', 'v2.0.12');
  assert.throws(
    () => validateReleaseDocumentIdentity('2.18.12', documents),
    /Release document identity mismatch: docs\/release-candidate-evidence-template\.md/,
  );
});

test('rejects a stale lockfile policy candidate identity', () => {
  const documents = releaseDocuments();
  documents.lockfilePolicy = 'Current release-preparation target: **2.0.12**.';
  assert.throws(
    () => validateReleaseDocumentIdentity('2.18.12', documents),
    /Release document identity mismatch: docs\/lockfile-policy\.md/,
  );
});
