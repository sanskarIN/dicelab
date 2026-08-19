import assert from 'node:assert/strict';
import test from 'node:test';
import { auditRuntimeBoundaries } from './check-runtime-boundaries.mjs';

test('committed production source keeps Tauri access behind service adapters', async () => {
  assert.deepEqual(await auditRuntimeBoundaries(), []);
});
