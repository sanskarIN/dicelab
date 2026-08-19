import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { extractDocumentationTargets, markdownContainsAnchor, scanDocumentationLinks } from './check-doc-links.mjs';

test('extracts Markdown and HTML documentation targets', () => {
  const contents = [
    '[Guide](docs/guide.md)',
    '![Logo](assets/logo.png)',
    '<a href="docs/release.md#draft-release-review">Release</a>',
    '<img src="assets/icon.png" alt="Icon" />',
    '<a href="https://example.com">External</a>',
  ].join('\n');

  assert.deepEqual(extractDocumentationTargets(contents), [
    'docs/guide.md',
    'assets/logo.png',
    'docs/release.md#draft-release-review',
    'assets/icon.png',
    'https://example.com',
  ]);
});

test('recognizes heading anchors, duplicate heading suffixes, and explicit ids', () => {
  const contents = [
    '# Release Guide',
    '## Draft Review',
    '## Draft Review',
    '<a id="manual-anchor"></a>',
  ].join('\n');

  assert.equal(markdownContainsAnchor(contents, 'release-guide'), true);
  assert.equal(markdownContainsAnchor(contents, 'draft-review'), true);
  assert.equal(markdownContainsAnchor(contents, 'draft-review-1'), true);
  assert.equal(markdownContainsAnchor(contents, 'manual-anchor'), true);
  assert.equal(markdownContainsAnchor(contents, 'missing-anchor'), false);
});

test('passes valid Markdown and local HTML references including anchors', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'dicelab-doc-links-valid-'));
  try {
    await fs.mkdir(path.join(root, 'docs'));
    await fs.mkdir(path.join(root, 'assets'));
    await fs.writeFile(
      path.join(root, 'README.md'),
      [
        '[Guide](docs/guide.md#details)',
        '<a href="docs/guide.md#details">HTML guide</a>',
        '<img src="assets/icon.png" alt="Icon" />',
        '<a href="https://example.com">External</a>',
      ].join('\n'),
    );
    await fs.writeFile(path.join(root, 'docs/guide.md'), '# Guide\n\n## Details\n');
    await fs.writeFile(path.join(root, 'assets/icon.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    const result = await scanDocumentationLinks(root);
    assert.deepEqual(result.errors, []);
    assert.equal(result.markdownFiles.length, 2);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('reports missing Markdown paths, missing HTML assets, and missing anchors', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'dicelab-doc-links-invalid-'));
  try {
    await fs.mkdir(path.join(root, 'docs'));
    await fs.writeFile(
      path.join(root, 'README.md'),
      [
        '[Missing](docs/missing.md)',
        '<img src="missing.png" alt="Missing" />',
        '[Bad anchor](docs/guide.md#not-there)',
      ].join('\n'),
    );
    await fs.writeFile(path.join(root, 'docs/guide.md'), '# Guide\n\n## Present\n');

    const result = await scanDocumentationLinks(root);
    assert.deepEqual(result.errors, [
      'README.md -> docs/guide.md#not-there (missing anchor)',
      'README.md -> docs/missing.md (missing)',
      'README.md -> missing.png (missing)',
    ]);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('reports malformed percent encoding as a broken local target', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'dicelab-doc-links-percent-'));
  try {
    await fs.writeFile(path.join(root, 'README.md'), '[Broken](docs/%ZZ.md)\n');
    const result = await scanDocumentationLinks(root);
    assert.deepEqual(result.errors, ['README.md -> docs/%ZZ.md (missing)']);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
