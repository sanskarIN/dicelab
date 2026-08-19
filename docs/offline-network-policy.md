# Offline CSP network policy

DiceLab is designed to remain useful without an account or remote application service. The desktop Content Security Policy therefore should not gain remote network origins accidentally.

## Allowed local runtime sources

The current Tauri runtime may use local application sources such as:

- `'self'`
- `asset:`
- `ipc:`
- `data:` where required for local image/data rendering
- `http://asset.localhost`
- `http://ipc.localhost`

These are local Tauri/webview mechanisms rather than external application services.

## Disallowed CSP network expansion

The repository policy rejects remote/network source tokens such as:

- `http:`
- `https:`
- `ws:`
- `wss:`
- remote `http://...` origins
- remote `https://...` origins
- remote WebSocket origins

The audit applies to every CSP directive rather than only `script-src`, so a future change cannot quietly add an external image, font, connection, frame, or script origin without an explicit policy decision.

## Auditor

Run:

```bash
node scripts/check-offline-csp.mjs
```

The script audits `app.security.csp` in `src-tauri/tauri.conf.json`. If a separate `devCsp` is configured later, it is audited as well.

## Self-tests

```bash
node --test scripts/check-offline-csp.test.mjs
node --test scripts/check-offline-csp.integration.test.mjs
```

The synthetic tests prove that local Tauri asset/IPC sources are accepted while remote HTTP/HTTPS/WebSocket sources are rejected. The integration regression evaluates the committed Tauri configuration.

## CI

`.github/workflows/offline-csp-audit.yml` runs the policy for relevant pushes, pull requests, manual dispatches, and version tags.

As with every repository workflow, configuration is not release evidence. Record an observed successful candidate run before treating the policy check as passed for a release.

## External links versus application network dependencies

DiceLab documentation/About surfaces may contain user-initiated links to the repository, support, release notes, privacy information, or optional funding. A user choosing to open an external link is different from the application silently depending on remote origins for core operation.

Do not add a remote CSP origin merely to make a new embedded resource convenient. Prefer bundling required product assets locally.

## Adding a remote dependency

A future product requirement that genuinely needs a remote application origin must not be introduced as a quiet CSP edit.

Before changing this policy:

1. document why the feature cannot remain local/offline;
2. identify exactly what data leaves the device and why;
3. review privacy, security, consent, and failure behavior;
4. prefer a narrowly scoped origin and directive;
5. update the privacy/security documentation;
6. add an ADR for the changed trust boundary;
7. add tests that reject unrelated remote origins;
8. verify the application remains understandable/useful when the remote service is unavailable.

## Related documentation

- [`tauri-security-policy.md`](tauri-security-policy.md)
- [`capability-policy.md`](capability-policy.md)
- [`runtime-boundary-policy.md`](runtime-boundary-policy.md)
- [`native-command-contract.md`](native-command-contract.md)
- [`architecture.md`](architecture.md)
- [`../PRIVACY.md`](../PRIVACY.md)
- [`../SECURITY.md`](../SECURITY.md)
