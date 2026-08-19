import assert from 'node:assert/strict';
import test from 'node:test';
import { auditCapabilityDocument } from './check-capabilities.mjs';

const safeCapability = {
  identifier: 'default',
  description: 'DiceLab main window',
  windows: ['main'],
  permissions: ['core:default'],
};

test('accepts the intended narrow main-window capability', () => {
  assert.deepEqual(auditCapabilityDocument(safeCapability, 'default.json'), []);
});

test('rejects broad filesystem permissions', () => {
  assert.deepEqual(
    auditCapabilityDocument({ ...safeCapability, permissions: ['core:default', 'fs:allow-write-file'] }, 'fs.json'),
    ['fs.json: broad permission family is not allowed: fs:allow-write-file'],
  );
});

test('rejects shell, http, and process permission families', () => {
  const findings = auditCapabilityDocument(
    {
      ...safeCapability,
      permissions: ['shell:default', 'http:default', { identifier: 'process:allow-restart', allow: [] }],
    },
    'unsafe.json',
  );

  assert.deepEqual(findings, [
    'unsafe.json: broad permission family is not allowed: shell:default',
    'unsafe.json: broad permission family is not allowed: http:default',
    'unsafe.json: broad permission family is not allowed: process:allow-restart',
  ]);
});

test('rejects remote-origin capability access', () => {
  assert.deepEqual(
    auditCapabilityDocument({ ...safeCapability, remote: { urls: ['https://example.invalid'] } }, 'remote.json'),
    ['remote.json: remote-origin capability access is not allowed'],
  );
});

test('rejects wildcard window targets', () => {
  assert.deepEqual(
    auditCapabilityDocument({ ...safeCapability, windows: ['*'] }, 'wildcard.json'),
    ['wildcard.json: wildcard or invalid window capability target is not allowed'],
  );
});

test('rejects malformed permission entries', () => {
  assert.deepEqual(
    auditCapabilityDocument({ ...safeCapability, permissions: [42] }, 'malformed.json'),
    ['malformed.json: permission entries must be strings or scoped permission objects'],
  );
});
