import assert from 'node:assert/strict';
import test from 'node:test';
import { auditCapabilities } from './check-capabilities.mjs';

test('committed desktop capabilities satisfy the narrow policy', async () => {
  assert.deepEqual(await auditCapabilities(), []);
});
