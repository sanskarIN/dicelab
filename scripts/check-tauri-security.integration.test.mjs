import assert from 'node:assert/strict';
import test from 'node:test';
import { auditTauriSecurityFile } from './check-tauri-security.mjs';

test('committed Tauri configuration satisfies the security policy', async () => {
  assert.deepEqual(await auditTauriSecurityFile(), []);
});
