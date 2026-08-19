import assert from 'node:assert/strict';
import test from 'node:test';
import { auditOfflineCsp, auditOfflineTauriConfig } from './check-offline-csp.mjs';

const safeCsp = "default-src 'self'; img-src 'self' asset: http://asset.localhost data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src ipc: http://ipc.localhost";

test('accepts local Tauri asset and IPC endpoints', () => {
  assert.deepEqual(auditOfflineCsp(safeCsp), []);
});

test('rejects remote HTTPS sources in any directive', () => {
  assert.deepEqual(
    auditOfflineCsp("default-src 'self'; img-src 'self' https://cdn.example.invalid", 'csp'),
    ['csp: remote network source is not allowed in img-src: https://cdn.example.invalid'],
  );
});

test('rejects remote network scheme sources', () => {
  assert.deepEqual(
    auditOfflineCsp("default-src 'self'; connect-src https: wss:", 'csp'),
    [
      'csp: remote network scheme source is not allowed in connect-src: https:',
      'csp: remote network scheme source is not allowed in connect-src: wss:',
    ],
  );
});

test('allows non-network local schemes used by DiceLab', () => {
  assert.deepEqual(
    auditOfflineCsp("default-src 'self'; img-src asset: data:; connect-src ipc:", 'csp'),
    [],
  );
});

test('audits a configured development CSP as well as production CSP', () => {
  const config = {
    app: {
      security: {
        csp: safeCsp,
        devCsp: "default-src 'self'; connect-src https://dev.example.invalid",
      },
    },
  };
  assert.deepEqual(auditOfflineTauriConfig(config, 'tauri.conf.json'), [
    'tauri.conf.json: app.security.devCsp: remote network source is not allowed in connect-src: https://dev.example.invalid',
  ]);
});
