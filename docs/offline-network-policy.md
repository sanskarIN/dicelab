# Offline CSP network policy

DiceLab is designed to remain useful without an account or remote application service. The packaged desktop Content Security Policy therefore must not gain remote network origins accidentally.

## Production policy

The production CSP may use local application/runtime sources such as:

- `'self'`
- `asset:`
- `ipc:`
- `data:` where required for local image/data rendering
- `http://asset.localhost`
- `http://ipc.localhost`

These are local Tauri/webview mechanisms rather than external application services.

Production policy rejects network expansion such as:

- `http:`
- `https:`
- `ws:`
- `wss:`
- explicit remote `http://...` origins;
- explicit remote `https://...` origins;
- explicit remote WebSocket origins;
- explicit loopback dev-server origins such as `http://localhost:1420` in the packaged production CSP.

The audit applies to every CSP directive rather than only `script-src`, so a future change cannot quietly add an external image, font, connection, frame, or script origin without an explicit policy decision.

## Development-only loopback exception

Tauri development mode is different from a packaged build: Vite serves the renderer on a loopback address and HMR can use a loopback WebSocket.

When auditing `app.security.devCsp`, DiceLab permits only **explicit loopback URLs** for that development mechanism:

```text
http://localhost:1420
https://localhost:1420
http://127.0.0.1:1420
ws://localhost:1421
wss://[::1]:1421
```

Supported loopback host forms are:

- `localhost`
- `127.0.0.1`
- `[::1]`

The exception is intentionally narrow:

- it applies only to `devCsp`;
- it applies to explicit URLs, not scheme-wide `http:` / `https:` / `ws:` / `wss:` sources;
- it does not accept non-loopback development hosts;
- it does not change the packaged production CSP policy.

This prevents the repository audit from reporting the legitimate local Vite/Tauri dev server as a remote product dependency while keeping real remote origins blocked.

## Auditor

Run:

```bash
node scripts/check-offline-csp.mjs
```

The script audits:

- `app.security.csp` with strict production rules;
- `app.security.devCsp`, when present, with the explicit loopback development exception described above.

## Self-tests

```bash
node --test scripts/check-offline-csp.test.mjs
node --test scripts/check-offline-csp.integration.test.mjs
```

The synthetic tests prove that:

- local Tauri asset/IPC sources are accepted;
- explicit Vite/HMR loopback URLs are accepted in `devCsp`;
- loopback URLs remain rejected in production CSP;
- scheme-wide network sources remain rejected even in development policy;
- non-loopback development origins remain rejected.

The integration regression evaluates the committed Tauri configuration.

## CI

`.github/workflows/offline-csp-audit.yml` runs the policy for relevant pushes, pull requests, manual dispatches, and version tags.

As with every repository workflow, configuration is not release evidence. Record an observed successful candidate run before treating the policy check as passed for a release.

## External links versus application network dependencies

DiceLab documentation/About surfaces may contain user-initiated links to the repository, support, release notes, privacy information, or optional funding. A user choosing to open an external link is different from the application silently depending on remote origins for core operation.

Do not add a remote CSP origin merely to make a new embedded resource convenient. Prefer bundling required product assets locally.

## Adding a remote product dependency

A future product requirement that genuinely needs a remote application origin must not be introduced as a quiet CSP edit or disguised as a development exception.

Before changing this policy:

1. document why the feature cannot remain local/offline;
2. identify exactly what data leaves the device and why;
3. review privacy, security, consent, and offline failure behavior;
4. prefer a narrowly scoped origin and directive;
5. update the privacy/security documentation;
6. add or supersede an ADR for the changed trust boundary;
7. add tests that reject unrelated remote origins;
8. verify the application remains understandable/useful when the remote service is unavailable;
9. verify development loopback allowances have not leaked into the production CSP.

## Related documentation

- [`tauri-security-policy.md`](tauri-security-policy.md)
- [`capability-policy.md`](capability-policy.md)
- [`runtime-boundary-policy.md`](runtime-boundary-policy.md)
- [`native-command-contract.md`](native-command-contract.md)
- [`architecture.md`](architecture.md)
- [`../PRIVACY.md`](../PRIVACY.md)
- [`../SECURITY.md`](../SECURITY.md)
