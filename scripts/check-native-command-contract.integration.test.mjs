import assert from 'node:assert/strict';
import test from 'node:test';
import { auditNativeCommandContract } from './check-native-command-contract.mjs';

test('committed frontend and Rust native command surfaces stay synchronized', async () => {
  assert.deepEqual(await auditNativeCommandContract(), []);
});
