# Dependency lockfile consistency policy

DiceLab commits npm and Cargo lockfiles so CI/release builds use a reviewed dependency graph instead of resolving a different graph at each run.

Current release-preparation target: **2.0.12**.

## Required lockfiles

- `package.json` → `package-lock.json`
- `src-tauri/Cargo.toml` → `src-tauri/Cargo.lock`

A dependency-manifest or application-version change is incomplete until its generated lockfile is committed.

## Two independent lock-related audits

DiceLab deliberately separates **dependency request consistency** from **application-version consistency**. Both are required; neither replaces package-manager generation.

### 1. Dependency-free direct-dependency consistency audit

Run:

```bash
node scripts/check-lockfile-consistency.mjs
```

The audit performs an early structural check before package-manager installation.

#### npm

It compares direct `dependencies`, `devDependencies`, and `optionalDependencies` in `package.json` with the root package metadata stored in `package-lock.json` and reports:

- missing direct lockfile requests;
- stale direct requests no longer present in the manifest;
- requested-version/range mismatches.

#### Cargo

It reads direct dependency declarations from:

- `[dependencies]`
- `[dev-dependencies]`
- `[build-dependencies]`
- target-specific dependency sections.

It then verifies that each direct crate/package name exists in `Cargo.lock`. Manifest aliases using `package = "..."` are resolved to the real crate name before comparison.

This deliberately does **not** attempt to regenerate or hand-construct Cargo's transitive graph.

### 2. Generated application-version consistency audit

Run:

```bash
node scripts/check-version-sync.mjs
```

For a release candidate/tag check:

```bash
DICELAB_EXPECT_VERSION=v2.0.12 node scripts/check-version-sync.mjs
```

The audit requires exact semantic-version agreement across:

- `package.json`;
- top-level `package-lock.json` version;
- `package-lock.json` root `packages[""]` version;
- `src/config/app.ts`;
- `src-tauri/Cargo.toml`;
- the `dicelab` package entry in `src-tauri/Cargo.lock`;
- `src-tauri/tauri.conf.json`;
- the optional expected tag/version when supplied.

This closes a different class of stale-lock problem: a manifest can have unchanged dependency ranges yet still require a generated lock update because the application package version changed.

## Self-tests

Run dependency-lock self-tests with:

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

Run version-agreement self-tests with:

```bash
node --test scripts/check-version-sync.test.mjs
```

These cover npm lock top/root versions, Cargo manifest/package-lock extraction, Cargo package blocks at normal boundaries/end-of-file, SemVer agreement, and tag mismatch behavior.

## Release gates

`.github/workflows/release-lockfile-consistency.yml` runs the direct dependency-lock auditor for version tags/manual dispatches. The main tag-driven `.github/workflows/release.yml` also runs repository policy gates and the lock-aware version checker before dependency installation/artifact production.

These workflows are intentionally evidence-oriented. They do not silently regenerate an invalid candidate during release verification. If a lock is stale, the candidate must be fixed first.

## Generating lockfiles

For npm:

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
npm ci
```

For Cargo:

```bash
cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

Then return to the repository root and run:

```bash
npm run policy:lockfiles
npm run version:check
```

For the current candidate:

```bash
DICELAB_EXPECT_VERSION=v2.0.12 npm run version:check
```

Use a network-enabled environment with the normal package managers. Do not hand-edit transitive lockfile entries simply to satisfy an audit.

## Lockfile generation workflow

`.github/workflows/lockfiles.yml` is the package-manager generation path. It currently:

1. regenerates `package-lock.json` with npm;
2. regenerates `src-tauri/Cargo.lock` with Cargo;
3. validates Cargo's generated graph using locked `cargo metadata`;
4. runs the lock-aware application-version audit against the newly generated files;
5. runs `git diff --check`;
6. commits only changed lockfiles;
7. rebases against current `main`;
8. pushes to `main`, or publishes the exact generated commit to `automation/lockfiles` if protected `main` rejects the direct update.

The generator therefore cannot publish locks that still carry an older DiceLab package version while the manifests/configuration say 2.0.12.

## Current 2.0.12 lock state

At the latest direct audit, generation has **not** completed successfully yet.

Observed npm state:

```text
package.json                         2.0.12
package-lock.json top-level          0.1.0
package-lock.json packages[""]       0.1.0
```

Observed Rust state:

```text
src-tauri/Cargo.toml package         2.0.12
src-tauri/Cargo.lock dicelab package 0.1.0
```

The Cargo manifest additionally declares:

```toml
tauri-plugin-dialog = "2.7.2"
```

but the currently observed DiceLab `Cargo.lock` package block does not list that dependency. This is a real blocker, not documentation-only drift.

## Current release rule

A configured generation workflow is not proof that the lockfiles are current. Release readiness requires all of the following:

- generated npm/Cargo locks are visibly committed on the exact candidate commit;
- npm top/root package versions match the candidate version;
- the DiceLab Cargo-lock package version matches the candidate version;
- all current direct dependencies, including `tauri-plugin-dialog`, are represented in the generated Cargo graph;
- the dependency-free structural audit passes;
- the lock-aware version audit passes;
- `npm ci` passes;
- locked Rust tests/Clippy pass;
- dependency/security review is performed on the resulting graph.

## Relationship to release evidence

Record the actual candidate state in [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md). Do not mark dependency integrity complete from configuration alone.

## Related documentation

- [`release.md`](release.md)
- [`release-blockers-current.md`](release-blockers-current.md)
- [`automation-reference.md`](automation-reference.md)
- [`data-contracts.md`](data-contracts.md)
- [`testing.md`](testing.md)
- [`development.md`](development.md)
- [`repository-policy-gates.md`](repository-policy-gates.md)
- [`../ROADMAP.md`](../ROADMAP.md)
