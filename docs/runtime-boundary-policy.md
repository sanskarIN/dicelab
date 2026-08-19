# Native runtime service boundary

DiceLab keeps Tauri-specific renderer access behind a small service boundary instead of allowing components and domain modules to call native APIs directly.

## Production rule

Direct imports or dynamic imports of `@tauri-apps/api/core` are currently allowed only in:

- `src/services/roll-service.ts`
- `src/services/export.ts`

Direct probing of the Tauri runtime marker `__TAURI_INTERNALS__` is currently allowed only in:

- `src/services/runtime.ts`

Tests may mock these boundaries as needed, but production React components, domain modules, and unrelated services should depend on product-level adapters rather than Tauri internals.

## Why this matters

Keeping native access centralized provides several benefits:

- browser and desktop behavior remain explicit and testable;
- React components do not grow platform-specific branches;
- domain rules stay independent from Tauri;
- security review has a small number of renderer-to-native call sites;
- a future Tauri API change can be adapted in one place;
- mocked browser tests do not need to know native implementation details;
- capability expansion is easier to detect and justify.

## Auditor

Run:

```bash
node scripts/check-runtime-boundaries.mjs
```

The dependency-free audit scans production TypeScript/TSX under `src/` and rejects:

- `@tauri-apps/api/core` outside the approved roll/export service adapters;
- `__TAURI_INTERNALS__` probing outside `src/services/runtime.ts`.

Files ending in `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` are excluded from the production-source audit so tests can mock the native boundary deliberately.

## Self-tests

```bash
node --test scripts/check-runtime-boundaries.test.mjs
node --test scripts/check-runtime-boundaries.integration.test.mjs
```

The integration regression audits the actual committed production source.

## CI

`.github/workflows/runtime-boundary-audit.yml` runs the auditor and self-tests for relevant source/policy changes and supports manual dispatch.

Configured automation is not release evidence by itself. Required status-check names should only be copied into branch protection after a successful run is observed.

## Adding another native feature

Do not bypass this boundary by importing Tauri directly into a component.

For a new native feature:

1. define the product-level operation and browser behavior first;
2. add or extend a focused service adapter;
3. keep validation in the narrowest appropriate domain/native boundary;
4. use `src/services/runtime.ts` for runtime detection;
5. add browser/native routing tests;
6. review Tauri capabilities and CSP impact;
7. document any new native command/trust boundary;
8. update this auditor's allowlist only when the new production adapter is intentionally reviewed.

If the feature materially expands native permissions, add or update an ADR.

## Related policy

- [`architecture.md`](architecture.md)
- [`capability-policy.md`](capability-policy.md)
- [`tauri-security-policy.md`](tauri-security-policy.md)
- [`native-exports.md`](native-exports.md)
- [`../SECURITY.md`](../SECURITY.md)
