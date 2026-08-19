import assert from 'node:assert/strict';
import test from 'node:test';
import { auditLocalizedFormatting } from './check-localized-formatting.mjs';

test('committed localized UI uses the shared formatting boundary', async () => {
  assert.deepEqual(await auditLocalizedFormatting(), []);
});
