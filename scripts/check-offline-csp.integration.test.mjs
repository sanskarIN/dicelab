import assert from 'node:assert/strict';
import test from 'node:test';
import { auditOfflineTauriSecurityFile } from './check-offline-csp.mjs';

test('committed Tauri CSP contains no remote network sources', async () => {
  assert.deepEqual(await auditOfflineTauriSecurityFile(), []);
});
