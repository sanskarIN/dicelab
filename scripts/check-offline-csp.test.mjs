import assert from 'node:assert/strict';
import test from 'node:test';
import { auditOfflineCsp, auditOfflineTauriConfig } from './check-offline-csp.mjs';

const safeCsp = "default-src 'self'; img-src 'self' asset: http://asset.localhost data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src ipc: http://ipc.localhost";

test('accepts local Tauri asset and IPC endpoints', () => {
  assert.deepEqual(auditOfflineCsp(safeCsp), []);
});

test('allows explicit loopback development server and HMR sources only in devCsp', () => {
  const config = {
    app: {
      security: {
        csp: safeCsp,
        devCsp:
          "default-src 'self' http://localhost:1420; connect-src ipc: http://ipc.localhost http://127.0.0.1:1420 ws://localhost:1421 wss://[::1]:1421",
      },
    },
  };
  assert.deepEqual(auditOfflineTauriConfig(config, 'tauri.conf.json'), []);

  assert.deepEqual(auditOfflineCsp("default-src 'self' http://localhost:1420", 'production-csp'), [
    'production-csp: remote network source is not allowed in default-src: http://localhost:1420',
  ]);
});

test('rejects remote HTTPS sources in any directive', () => {
  assert.deepEqual(
    auditOfflineCsp("default-src 'self'; img-src 'self' https://cdn.example.invalid", 'csp'),
    ['csp: remote network source is not allowed in img-src: https://cdn.example.invalid'],
  );
});

test('rejects remote network scheme sources even when loopback URLs are allowed', () => {
  assert.deepEqual(
    auditOfflineCsp("default-src 'self'; connect-src https: wss:", 'csp', { allowLoopback: true }),
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

test('rejects non-loopback development origins', () => {
  const config = {
    app: {
      security: {
        csp: safeCsp,
        devCsp: "default-src 'self'; connect-src https://dev.example.invalid ws://dev.example.invalid",
      },
    },
  };
  assert.deepEqual(auditOfflineTauriConfig(config, 'tauri.conf.json'), [
    'tauri.conf.json: app.security.devCsp: remote network source is not allowed in connect-src: https://dev.example.invalid',
    'tauri.conf.json: app.security.devCsp: remote network source is not allowed in connect-src: ws://dev.example.invalid',
  ]);
});
