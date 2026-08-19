# Development Guide

## Principles

DiceLab favors simple, explicit modules over framework-heavy abstractions. Keep business rules separate from UI, validate data at boundaries, and prefer small changes that can be tested independently.

## Repository layout

```text
src/
  components/      React interaction surfaces
  domain/          dice rules and calculations
  services/        browser/native boundaries and persistence
  test/            shared test setup
src-tauri/
  capabilities/    desktop permissions
  icons/           application branding
  src/              native Rust application core
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
npm run format
npm run lint
npm run test
npm run build
```

For Rust changes:

```bash
cd src-tauri
cargo fmt --all -- --check
cargo test
cargo clippy --all-targets --all-features -- -D warnings
```

## Domain rules

- Parse user expressions through the domain parser rather than ad-hoc regular expressions in components.
- Keep count/sides/modifier bounds consistent across TypeScript and Rust.
- Keep selection semantics deterministic when dice tie by using a stable index tie-breaker.
- Never route seeded mode through the secure-random code path or describe seeded output as secure.
- Every fixed domain bug should receive a regression test.

## React conventions

- Keep components focused on one interaction surface.
- Pass data and callbacks rather than reading persistence directly.
- Prefer native semantic elements before custom ARIA roles.
- Avoid effects for values that can be derived during render.
- Keep destructive actions reversible or explicitly confirmed where practical.
- Do not introduce global mutable state for convenience.

## Persistence conventions

Local-storage keys are versioned. A schema change that cannot read old data safely must use a new key version and document migration behavior.

Backup import is a trust boundary. Keep size limits and structural validation in the service layer.

## Error conventions

User-facing errors should:

- explain the corrective action;
- avoid stack traces and implementation secrets;
- never include credentials or unredacted sensitive content;
- fail locally without making unrelated app features unusable.

## Dependency policy

Add a dependency only when it provides enough maintained value to justify supply-chain and bundle cost. Prefer platform APIs or small local utilities for trivial behavior.

When dependencies change, regenerate and commit lockfiles from a network-enabled environment and review CI/security results.

## Documentation policy

When changing behavior, update the closest relevant documentation in the same pull request. Architecture changes should add or update an ADR.

## Versioning

The application version appears in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`. Release preparation must keep them aligned.

## Commit policy

Use small meaningful Conventional Commits. Do not create empty or artificial commits. The preferred author email for this repository is:

` sanskarin@outlook.in `
