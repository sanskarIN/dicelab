# Dependency lockfile consistency policy

DiceLab commits npm and Cargo lockfiles so CI/release builds use a reviewed dependency graph instead of resolving a different graph at each run.

## Required lockfiles

- `package.json` → `package-lock.json`
- `src-tauri/Cargo.toml` → `src-tauri/Cargo.lock`

A manifest change is incomplete until its generated lockfile is committed.

## Dependency-free consistency audit

Run:

```bash
node scripts/check-lockfile-consistency.mjs
```

The audit performs an early structural check before package-manager installation:

### npm

It compares direct `dependencies`, `devDependencies`, and `optionalDependencies` in `package.json` with the root package metadata stored in `package-lock.json` and reports:

- missing direct lockfile requests;
- stale direct requests no longer present in the manifest;
- requested-version/range mismatches.

### Cargo

It reads direct dependency declarations from:

- `[dependencies]`
- `[dev-dependencies]`
- `[build-dependencies]`
- target-specific dependency sections

It then verifies that each direct crate/package name exists in `Cargo.lock`. Manifest aliases using `package = "..."` are resolved to the real crate name before comparison.

This deliberately does **not** attempt to regenerate or hand-construct Cargo's transitive graph.

## Self-tests

Run:

```bash
node --test scripts/check-lockfile-consistency.test.mjs
```

Synthetic cases cover:

- matching npm direct requests;
- missing/stale/mismatched npm requests;
- Cargo dependency/build/target section parsing;
- Cargo package aliases;
- Cargo.lock package-name parsing;
- a direct Cargo dependency missing from the lockfile.

## Release gate

`.github/workflows/release-lockfile-consistency.yml` runs the self-test and actual repository consistency audit for version tags and manual dispatches.

The workflow is intentionally evidence-oriented. It does not silently regenerate the dependency graph during a release check. If the lock is stale, the candidate must be fixed first.

## Generating lockfiles

For npm:

```bash
npm install --package-lock-only --ignore-scripts
npm ci
```

For Cargo:

```bash
cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

Use a network-enabled environment with the normal package managers. Do not hand-edit transitive lockfile entries simply to satisfy the audit.

The repository also contains `.github/workflows/lockfiles.yml` for generated lockfile updates. If protected `main` rejects the workflow's direct push, it preserves the exact generated commit on `automation/lockfiles` for review/application.

## Current pre-release rule

A configured lockfile generation workflow is not proof that the lockfile is current. Release readiness requires all of the following:

- the generated lockfile is visibly committed on the candidate commit;
- the dependency-free structural audit passes;
- `npm ci` passes where npm metadata changed;
- locked Rust tests/Clippy pass where Cargo metadata changed;
- dependency/security review is performed on the resulting graph.

## Relationship to release evidence

Record the actual candidate state in [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md). Do not mark dependency integrity complete from configuration alone.

## Related documentation

- [`release.md`](release.md)
- [`testing.md`](testing.md)
- [`development.md`](development.md)
- [`repository-policy-gates.md`](repository-policy-gates.md)
- [`../ROADMAP.md`](../ROADMAP.md)
