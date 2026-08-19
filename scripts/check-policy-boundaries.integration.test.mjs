import assert from 'node:assert/strict';
import test from 'node:test';
import { auditPolicyBoundaries } from './check-policy-boundaries.mjs';

test('all committed policy boundaries satisfy their repository audits', async () => {
  assert.deepEqual(await auditPolicyBoundaries(), []);
});
