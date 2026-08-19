# Development Guide

## Principles

DiceLab favors simple, explicit modules over framework-heavy abstractions. Keep business rules separate from UI, validate data at boundaries, keep user-facing copy behind the locale catalog, use the shared locale-formatting boundary for display values, and prefer small changes that can be tested independently.

## Repository layout

```text
src/
  components/      React interaction surfaces
  config/          stable project/version/contact metadata
  domain/          dice rules, history query, persistence validation, and calculations
  i18n/            English/Hindi catalogs, locale state, formatters, and error-to-copy mapping
  services/        runtime/browser/native adapters, persistence, export/backup, and logging
  test/            shared browser test setup
scripts/            repository quality, security, version, benchmark-support, and browser-E2E utilities
src-tauri/
  capabilities/    desktop permissions
  fuzz/            coverage-guided native parser harness
  icons/           application branding
  src/             native parser, rolling, and bounded export command
.github/            CI, fuzzing, security, dependency, and release automation
docs/               engineering and user documentation
```

## Typical development loop

Web UI/domain work:

```bash
npm run dev
npm run test:watch
```

Desktop/native work:

```bash
npm run tauri:dev
```

Fast dependency-free repository checks:

```bash
npm run security:secrets:test
npm run security:secrets
npm run test:e2e:infra
npm run version:check:test
npm run version:check
```

Before committing frontend/web changes:

```bash
npm ci
npm run docs:check
npm run format
npm run lint
npm run test
npm run build
npm run test:e2e
```

The real-browser E2E command requires the production `dist/` and a Chromium-compatible browser. Set `CHROME_BIN` if browser discovery cannot find one. See [`e2e.md`](e2e.md).

For Rust changes:

```bash
cd src-tauri
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

If `src-tauri/Cargo.toml` changes, regenerate the lock before those locked checks:

```bash
cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

Do not hand-edit generated Cargo dependency entries to make a stale lockfile look current.

For coverage-guided native parser fuzzing, use a network-enabled environment with Rust nightly and `cargo-fuzz`:

```bash
cd src-tauri
cargo +nightly fuzz run parser -- -max_total_time=60
```

See [`../src-tauri/fuzz/README.md`](../src-tauri/fuzz/README.md).

Performance-sensitive work should also measure the relevant benchmark set:

```bash
npm run bench
```

Benchmark output is not a hard timing gate; record hardware/runtime metadata before interpreting differences. See [`performance.md`](performance.md).

## Domain rules

- Parse user expressions through the domain parser rather than ad-hoc regular expressions in components.
- Keep count/sides/modifier bounds consistent across TypeScript and Rust.
- Keep selection semantics deterministic when dice tie by using a stable index tie-breaker.
- Keep web and desktop seeded RNG compatibility vectors synchronized.
- Never route seeded mode through the secure-random code path or describe seeded output as secure.
- Persisted TypeScript-shaped data is still untrusted at runtime; validate it before use.
- Keep history filtering in `src/domain/history.ts` so UI/tests/benchmarks share one query implementation.
- Parser/probability/backup errors exposed to presentation code use stable codes and bounded context rather than English prose as the behavioral contract.
- Every fixed domain bug should receive a regression test.

## React conventions

- Keep components focused on one interaction surface.
- Pass data and callbacks rather than reading persistence directly.
- Prefer native semantic elements before custom ARIA roles.
- Avoid effects for values that can be derived during render.
- Keep destructive actions reversible or explicitly confirmed where practical.
- Do not introduce global mutable state for convenience.
- Keep modal focus behavior deliberate: initial focus, focus containment, Escape behavior where appropriate, and focus restoration.
- For potentially large lists, use bounded/progressive rendering rather than mounting thousands of rows at once.
- Never display arbitrary unknown/native exception prose directly to users; route known errors through the localization mapper and use a safe localized fallback for unknown failures.
- Native/browser-specific behavior belongs behind a service adapter, not inline runtime checks spread across components.

## Localization conventions

DiceLab currently ships reviewed English and Hindi catalogs. English remains the default.

When adding copy:

- add the message to the closest English catalog section;
- add the corresponding Hindi message in the same change;
- keep both catalogs compatible with `MessageCatalog`;
- use a catalog function for dynamic phrases instead of concatenating separately translated fragments;
- keep technical dice notation and stable internal identifiers out of translation unless they are explanatory prose;
- preserve accessible names when migrating labels;
- map parser/probability/backup error codes in `src/i18n/errors.ts`;
- update [`localization.md`](localization.md) when the locale contract changes.

When displaying application-generated numbers/dates/times:

- use helpers from `src/i18n/format.ts`;
- do not depend on the host browser's default locale independently from DiceLab's selected language;
- keep exported/stored machine-readable values locale-neutral.

A future locale must implement the complete `MessageCatalog`, extend `LocalePreference`, add an explicit `Intl` mapping, pass persistence/backup/interface/formatting regression coverage, and receive review before the Settings selector exposes it.

## Runtime and native-service conventions

Use `src/services/runtime.ts` to decide whether a service is running inside Tauri. Do not duplicate Tauri-global detection logic across product modules.

Current native commands:

- `roll_expression`
- `save_text_export`

`save_text_export` is intentionally not a general filesystem write primitive. The frontend may supply a bounded suggested filename, contents, and allowlisted format; the system dialog chooses the destination path in Rust. Any new export format must extend the native validation allowlist and tests rather than granting broad filesystem access to the webview.

See [`native-exports.md`](native-exports.md).

## Persistence conventions

Local-storage keys are versioned. A schema change that cannot read old data safely must use a new key version and document migration behavior.

Backup import is a trust boundary. Keep size limits, duplicate detection, canonical timestamp checks, and structural/domain validation in the service/domain boundary. Ordinary local-storage recovery may discard malformed entries, but explicit backup import should reject ambiguous input instead of silently changing the supplied backup.

Locale persistence is part of settings schema-v1 compatibility. Missing/unsupported locale values normalize to English; do not make older schema-v1 backups unreadable solely because a locale preference was added later.

## Logging conventions

Use `src/services/logger.ts` for operational diagnostics instead of arbitrary `console.*` calls in product code.

- Log stable event names and minimal bounded metadata.
- Never log configured seeds, expressions, history, presets, backup contents, file payloads, email/name fields, credentials, raw `Error.message`, or stacks.
- Normal invalid user input is not an operational incident and should not be logged by default.
- New diagnostic context must be covered by redaction tests when it could ever contain user-controlled values.

See [`logging.md`](logging.md).

## Error conventions

User-facing errors should:

- explain the corrective action;
- use stable domain/backup error codes where the failure is expected and categorized;
- avoid stack traces and implementation secrets;
- never include credentials or unredacted sensitive content;
- never expose private filesystem paths from native export failures;
- fail locally without making unrelated app features unusable.

The root `AppErrorBoundary` is a last-resort recovery surface, not a replacement for handling expected failures near their source.

## Dependency policy

Add a dependency only when it provides enough maintained value to justify supply-chain and bundle cost. Prefer platform APIs or small local utilities for trivial behavior.

The browser E2E runner intentionally uses Node 22 + Chromium CDP instead of adding a browser automation dependency solely for a smoke workflow. If future E2E requirements justify Playwright/Puppeteer/etc., install it normally in a network-enabled environment and review the generated lockfile/dependency/security impact.

When dependencies change, regenerate and commit lockfiles from a network-enabled environment and review CI/security results. Do not hand-edit generated lockfiles to simulate a dependency installation.

The lockfile workflow supports manual dispatch. If protected `main` rejects its generated commit, the workflow is configured to preserve the exact generated result on `automation/lockfiles` for review. That automation path is not evidence that a manifest is actually locked until the resulting lockfile is visible in the target commit and locked checks pass.

## Documentation policy

When changing behavior, update the closest relevant documentation in the same pull request. Architecture changes should add or update an ADR when they establish a durable trade-off rather than merely describing the current implementation.

Run:

```bash
npm run docs:check
```

The checker validates relative Markdown targets. External URLs still require release-time review from a network-enabled environment.

## Versioning

The executable/configuration application version appears in:

- `package.json`
- `src/config/app.ts`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

Run:

```bash
npm run version:check:test
npm run version:check
```

`CHANGELOG.md` must also describe the target release correctly, but it is reviewed semantically rather than parsed as a single version source.

## Repository governance

Before changing branch rules, required checks, Discussions, labels, milestones, or GitHub security settings, read [`repository-governance.md`](repository-governance.md). Do not guess required status-check names; observe a successful workflow first.

## Commit policy

Use small meaningful Conventional Commits. Do not create empty or artificial commits. The preferred author email for this repository is:

`sanskarin@outlook.in`
