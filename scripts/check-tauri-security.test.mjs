import assert from 'node:assert/strict';
import test from 'node:test';
import { auditCsp, auditTauriSecurityConfig } from './check-tauri-security.mjs';

const safeConfig = {
  app: {
    security: {
      csp: "default-src 'self'; img-src 'self' asset: http://asset.localhost data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src ipc: http://ipc.localhost",
    },
  },
};

test('accepts the current narrow Tauri CSP shape', () => {
  assert.deepEqual(auditTauriSecurityConfig(safeConfig, 'tauri.conf.json'), []);
});

test('allows loopback development origin while production policy remains strict', () => {
  const config = {
    app: {
      security: {
        csp: "default-src 'self'",
        devCsp: "default-src 'self' http://localhost:1420; connect-src ipc: http://ipc.localhost http://localhost:1420 ws://localhost:1421",
      },
    },
  };
  assert.deepEqual(auditTauriSecurityConfig(config, 'tauri.conf.json'), []);
  assert.deepEqual(auditCsp("default-src 'self' http://localhost:1420", 'production-csp'), [
    'production-csp: remote network script source is not allowed: http://localhost:1420',
  ]);
});

test('still rejects non-loopback development script origins', () => {
  const config = {
    app: {
      security: {
        csp: "default-src 'self'",
        devCsp: "default-src 'self' https://dev.example.invalid",
      },
    },
  };
  assert.deepEqual(auditTauriSecurityConfig(config, 'tauri.conf.json'), [
    'tauri.conf.json: app.security.devCsp: remote network script source is not allowed: https://dev.example.invalid',
  ]);
});

test('requires a non-empty CSP', () => {
  assert.deepEqual(auditCsp(null, 'csp'), ['csp: a non-empty CSP string is required']);
});

test('requires a self-anchored default source', () => {
  assert.deepEqual(
    auditCsp("default-src https://cdn.example.invalid", 'csp'),
    [
      "csp: default-src must include 'self'",
      'csp: remote network script source is not allowed: https://cdn.example.invalid',
    ],
  );
});

test('rejects wildcard sources and unsafe eval', () => {
  assert.deepEqual(
    auditCsp("default-src 'self'; script-src 'self' 'unsafe-eval' *", 'csp'),
    [
      'csp: wildcard source is not allowed in script-src',
      "csp: 'unsafe-eval' is not allowed in script-src",
    ],
  );
});

test('rejects remote network script sources', () => {
  assert.deepEqual(
    auditCsp("default-src 'self'; script-src 'self' https://cdn.example.invalid", 'csp'),
    ['csp: remote network script source is not allowed: https://cdn.example.invalid'],
  );
});

test('rejects dangerous remote-domain IPC configuration', () => {
  const config = {
    app: {
      security: {
        csp: "default-src 'self'",
        dangerousRemoteDomainIpcAccess: [{ domain: 'example.invalid', windows: ['main'] }],
      },
    },
  };
  assert.deepEqual(auditTauriSecurityConfig(config, 'tauri.conf.json'), [
    'tauri.conf.json: dangerousRemoteDomainIpcAccess must not be configured',
  ]);
});
