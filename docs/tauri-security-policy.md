# Tauri security configuration policy

DiceLab treats Tauri configuration as part of the application security boundary. A dependency-free repository audit checks the committed CSP and remote-IPC settings before those settings can drift silently.

## Auditor

Run:

```bash
node scripts/check-tauri-security.mjs
```

The auditor reads `src-tauri/tauri.conf.json` and requires:

- an `app.security` object;
- a non-empty Content Security Policy;
- `default-src` anchored to `'self'`;
- no wildcard CSP source;
- no `'unsafe-eval'` source;
- no unreviewed remote HTTP/HTTPS script source;
- no configured `dangerousRemoteDomainIpcAccess` block.

Tauri's internal local IPC/asset URLs are not treated as remote network script origins by the auditor.

## Production versus development CSP

Production and development have different runtime mechanics, but the development exception is intentionally narrow.

### Production CSP

`app.security.csp` remains strict. Explicit HTTP/HTTPS network origins—including `localhost`—are treated as remote script/network expansion unless they are Tauri's documented local `ipc.localhost` / `asset.localhost` mechanisms.

A packaged build must not depend on the Vite development server.

### Development CSP

Tauri development mode legitimately loads the Vite dev server and may use WebSocket HMR. The configured `devCsp` may therefore use **explicit loopback URLs only**, such as:

```text
http://localhost:1420
http://127.0.0.1:1420
http://[::1]:1420
ws://localhost:1421
```

The Tauri security script's script-source check permits explicit HTTP/HTTPS loopback origins only when auditing `devCsp`. The separate offline-network policy covers HTTP/HTTPS/WebSocket loopback sources across all directives.

The exception does **not** permit:

- non-loopback hosts such as `https://dev.example.com`;
- scheme-wide `http:` / `https:` / `ws:` / `wss:` allowances;
- wildcard sources;
- `unsafe-eval`;
- remote-domain IPC.

This distinction prevents the audit itself from breaking a legitimate Tauri/Vite development configuration while keeping the packaged production boundary offline-first.

## Why style `unsafe-inline` is not currently rejected

The policy specifically forbids script evaluation expansion. DiceLab's current styling model may still require inline style support for React-generated values such as chart widths/heights.

A future change may tighten style handling further, but the repository must not weaken script execution restrictions merely to simplify styling.

## Self-tests

Synthetic policy tests:

```bash
node --test scripts/check-tauri-security.test.mjs
```

Committed configuration regression:

```bash
node --test scripts/check-tauri-security.integration.test.mjs
```

The self-tests explicitly prove that:

- the current narrow production shape is accepted;
- explicit loopback development URLs are accepted in `devCsp`;
- the same loopback URL is not automatically accepted in production CSP;
- non-loopback development origins remain rejected;
- wildcard, `unsafe-eval`, missing self anchoring, and dangerous remote-domain IPC remain rejected.

## CI

`.github/workflows/tauri-security-audit.yml` runs the self-tests and audits the checked-out configuration on relevant pushes/pull requests. It also supports manual dispatch.

Required status-check names should be added to branch protection only after an actual successful run has been observed.

## Review requirements for CSP changes

When changing CSP/security configuration:

1. identify the product feature or development mechanism that requires the change;
2. prefer the narrowest source/permission needed;
3. keep production and development requirements separate;
4. use explicit loopback URLs for local development instead of broad network schemes;
5. do not introduce wildcard sources;
6. do not introduce `unsafe-eval`;
7. do not enable remote-domain IPC as a shortcut;
8. keep native/web runtime boundaries documented;
9. add regression tests for any newly permitted source class;
10. verify the packaged desktop build still loads expected local assets and IPC without depending on the dev server;
11. review the change together with Tauri capabilities, offline-network policy, and native commands;
12. update security documentation/ADR if the trust boundary changes materially.

## Relationship to capability and offline-network policy

These controls protect different layers:

- Tauri security/CSP limits what content/scripts/resources the webview can load/execute;
- offline-network policy rejects remote network origins across every CSP directive and defines the dev-loopback exception;
- capability declarations limit which Tauri/plugin operations the webview can invoke;
- purpose-built Rust commands validate application-specific native operations.

All layers should remain narrow.

Related documents:

- [`offline-network-policy.md`](offline-network-policy.md)
- [`capability-policy.md`](capability-policy.md)
- [`native-exports.md`](native-exports.md)
- [`architecture.md`](architecture.md)
- [`../SECURITY.md`](../SECURITY.md)
