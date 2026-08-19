import assert from 'node:assert/strict';
import test from 'node:test';
import { auditRepositoryFileReference } from './check-file-reference.mjs';

test('every tracked repository file is present in the exhaustive file reference', async () => {
  assert.deepEqual(await auditRepositoryFileReference(), { missing: [], stale: [] });
});
