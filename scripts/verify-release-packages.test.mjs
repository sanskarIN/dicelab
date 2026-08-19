import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseChecksumFile, validateReleaseMetadata, verifyReleaseDirectory } from './verify-release-packages.mjs';

const COMMIT = '0123456789abcdef0123456789abcdef01234567';

function metadata(overrides = {}) {
  return {
    schemaVersion: 1,
    project: 'DiceLab',
    repository: 'sanskarIN/dicelab',
    tag: 'v1.2.3',
    sourceCommit: COMMIT,
    workflowRunId: '12345',
    workflowRunAttempt: '1',
    ...overrides,
  };
}

function sha256(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

test('parses checksum entries and rejects duplicate or unsafe filenames', () => {
  const digest = 'a'.repeat(64);
  assert.deepEqual(parseChecksumFile(`${digest}  artifact.zip\n`), [{ filename: 'artifact.zip', sha256: digest }]);
  assert.throws(() => parseChecksumFile(`${digest} artifact.zip\n${digest} artifact.zip\n`), /Duplicate checksum/);
  assert.throws(() => parseChecksumFile(`${digest} ..\/secret\n`), /Unsafe checksum filename/);
});

test('validates release metadata and optional expected tag/commit', () => {
  const value = metadata();
  assert.equal(validateReleaseMetadata(value, { tag: 'v1.2.3', sourceCommit: COMMIT }), value);
  assert.throws(() => validateReleaseMetadata(value, { tag: 'v1.2.4' }), /tag mismatch/);
  assert.throws(() => validateReleaseMetadata(value, { sourceCommit: 'f'.repeat(40) }), /source commit mismatch/);
});

test('verifies checksums metadata and release files end to end', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'dicelab-release-verify-'));
  try {
    const archive = Buffer.from('artifact-content');
    const metadataText = `${JSON.stringify(metadata(), null, 2)}\n`;
    await fs.writeFile(path.join(root, 'dicelab-web-v1.2.3.zip'), archive);
    await fs.writeFile(path.join(root, 'RELEASE-METADATA.json'), metadataText);
    await fs.writeFile(
      path.join(root, 'SHA256SUMS.txt'),
      `${sha256(archive)}  dicelab-web-v1.2.3.zip\n${sha256(metadataText)}  RELEASE-METADATA.json\n`,
    );

    const result = await verifyReleaseDirectory(root, { tag: 'v1.2.3', sourceCommit: COMMIT });
    assert.equal(result.files.length, 2);
    assert.equal(result.metadata.repository, 'sanskarIN/dicelab');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects altered release files', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'dicelab-release-altered-'));
  try {
    const metadataText = `${JSON.stringify(metadata(), null, 2)}\n`;
    await fs.writeFile(path.join(root, 'artifact.zip'), 'changed');
    await fs.writeFile(path.join(root, 'RELEASE-METADATA.json'), metadataText);
    await fs.writeFile(
      path.join(root, 'SHA256SUMS.txt'),
      `${'0'.repeat(64)}  artifact.zip\n${sha256(metadataText)}  RELEASE-METADATA.json\n`,
    );
    await assert.rejects(() => verifyReleaseDirectory(root), /SHA-256 mismatch for artifact\.zip/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
