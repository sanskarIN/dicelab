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
- no remote HTTP/HTTPS script source;
- no configured `dangerousRemoteDomainIpcAccess` block.

Tauri's internal local IPC/asset URLs are not treated as remote network script origins by the auditor.

If a separate development CSP is configured later, it is audited by the same rules instead of receiving an implicit exception.

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

## CI

`.github/workflows/tauri-security-audit.yml` runs the self-tests and audits the checked-out configuration on relevant pushes/pull requests. It also supports manual dispatch.

Required status-check names should be added to branch protection only after an actual successful run has been observed.

## Review requirements for CSP changes

When changing CSP/security configuration:

1. identify the product feature that requires the change;
2. prefer the narrowest source/permission needed;
3. do not introduce wildcard sources;
4. do not introduce `unsafe-eval`;
5. do not enable remote-domain IPC as a shortcut;
6. keep native/web runtime boundaries documented;
7. add regression tests for any newly permitted source class;
8. verify the packaged desktop build still loads expected local assets and IPC;
9. review the change together with Tauri capabilities and native commands;
10. update security documentation/ADR if the trust boundary changes materially.

## Relationship to capability policy

CSP and Tauri capabilities protect different parts of the same desktop boundary:

- CSP limits what content/scripts/resources the webview can load/execute;
- capability declarations limit which Tauri/plugin operations the webview can invoke;
- purpose-built Rust commands validate application-specific native operations.

All three should remain narrow.

Related documents:

- [`capability-policy.md`](capability-policy.md)
- [`native-exports.md`](native-exports.md)
- [`architecture.md`](architecture.md)
- [`../SECURITY.md`](../SECURITY.md)
