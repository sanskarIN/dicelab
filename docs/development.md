# Development Guide

## Principles

DiceLab favors simple, explicit modules over framework-heavy abstractions. Keep business rules separate from UI, validate data at boundaries, keep user-facing copy behind the locale catalog, and prefer small changes that can be tested independently.

## Repository layout

```text
src/
  components/      React interaction surfaces
  config/          stable project/version/contact metadata
  domain/          dice rules, persistence validation, and calculations
  i18n/            typed English catalog and locale boundary
  services/        browser/native boundaries and persistence
  test/            shared browser test setup
scripts/            repository quality utilities
src-tauri/
  capabilities/    desktop permissions
  icons/           application branding
  src/             native Rust application core
.github/            automation and repository templates
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

Before committing:

```bash
npm run docs:check
npm run format
npm run lint
npm run test
npm run build
```

For Rust changes:

```bash
cd src-tauri
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

## Domain rules

- Parse user expressions through the domain parser rather than ad-hoc regular expressions in components.
- Keep count/sides/modifier bounds consistent across TypeScript and Rust.
- Keep selection semantics deterministic when dice tie by using a stable index tie-breaker.
- Keep web and desktop seeded RNG compatibility vectors synchronized.
- Never route seeded mode through the secure-random code path or describe seeded output as secure.
- Persisted TypeScript-shaped data is still untrusted at runtime; validate it before use.
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

## Localization conventions

English ships first, but migrated user-facing UI copy belongs in `src/i18n/en.ts` rather than inline component literals.

When adding copy:

- add the message to the closest catalog section;
- use a catalog function for dynamic phrases instead of concatenating separately translated fragments;
- keep technical dice notation and stable internal identifiers out of translation unless they are explanatory prose;
- preserve accessible names when migrating labels;
- update [`localization.md`](localization.md) when the locale contract changes.

Before a second locale ships, domain/parser errors that need translation should move to stable error identifiers so domain logic remains locale-neutral.

## Persistence conventions

Local-storage keys are versioned. A schema change that cannot read old data safely must use a new key version and document migration behavior.

Backup import is a trust boundary. Keep size limits, duplicate detection, canonical timestamp checks, and structural/domain validation in the service/domain boundary. Ordinary local-storage recovery may discard malformed entries, but explicit backup import should reject ambiguous input instead of silently changing the supplied backup.

## Error conventions

User-facing errors should:

- explain the corrective action;
- avoid stack traces and implementation secrets;
- never include credentials or unredacted sensitive content;
- fail locally without making unrelated app features unusable.

## Dependency policy

Add a dependency only when it provides enough maintained value to justify supply-chain and bundle cost. Prefer platform APIs or small local utilities for trivial behavior.

When dependencies change, regenerate and commit lockfiles from a network-enabled environment and review CI/security results. Do not hand-edit generated lockfiles to simulate a dependency installation.

## Documentation policy

When changing behavior, update the closest relevant documentation in the same pull request. Architecture changes should add or update an ADR.

Run:

```bash
npm run docs:check
```

The checker validates relative Markdown targets. External URLs still require release-time review from a network-enabled environment.

## Versioning

The application version appears in:

- `package.json`
- `src/config/app.ts`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `CHANGELOG.md`

Release preparation must keep them aligned.

## Commit policy

Use small meaningful Conventional Commits. Do not create empty or artificial commits. The preferred author email for this repository is:

`sanskarin@outlook.in`
