import assert from 'node:assert/strict';
import test from 'node:test';
import { scanText } from './check-secrets.mjs';

test('detects high-confidence token families without returning matched values', () => {
  const githubToken = `ghp_${'a'.repeat(36)}`;
  const awsKey = `AKIA${'A'.repeat(16)}`;
  const findings = scanText(`token=${githubToken}\naws=${awsKey}\n`, 'fixture.env');

  assert.deepEqual(findings, [
    { file: 'fixture.env', line: 1, rule: 'github-classic-token' },
    { file: 'fixture.env', line: 2, rule: 'aws-access-key' },
  ]);
  assert.equal(JSON.stringify(findings).includes(githubToken), false);
  assert.equal(JSON.stringify(findings).includes(awsKey), false);
});

test('detects private key headers without requiring private key body content', () => {
  const findings = scanText('before\n-----BEGIN PRIVATE KEY-----\nafter\n', 'credential.pem');
  assert.deepEqual(findings, [{ file: 'credential.pem', line: 2, rule: 'private-key' }]);
});

test('does not flag documented placeholders or ordinary identifiers', () => {
  const text = [
    'VITE_DICELAB_BUILD_LABEL=local',
    'GITHUB_TOKEN=<provided-by-actions>',
    'example=github_pat_placeholder',
    'aws=AKIAEXAMPLEONLY',
  ].join('\n');
  assert.deepEqual(scanText(text, '.env.example'), []);
});
