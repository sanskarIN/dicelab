# Dependency lockfile consistency policy

DiceLab commits npm and Cargo lockfiles so CI/release builds use a reviewed dependency graph instead of resolving a different graph at each run.

Current release-preparation target: **2.18.12**.

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

### 2. Generated application-version and candidate-document consistency audit

Run:

```bash
node scripts/check-version-sync.mjs
```

For a release candidate/tag check:

```bash
DICELAB_EXPECT_VERSION=v2.18.12 node scripts/check-version-sync.mjs
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

The normal audit also requires the active candidate identity to appear consistently in the current release-facing markers in README, roadmap, changelog, release guide, release blockers, release evidence, lockfile policy, and handoff. Historical release sections can continue to mention older versions.

This closes two stale-candidate classes: a manifest can have unchanged dependency ranges yet still require a generated lock update because the application package version changed, and release-facing documents can otherwise keep advertising an older candidate after machine metadata is updated.

During lockfile generation only, the workflow uses:

```bash
node scripts/check-version-sync.mjs --metadata-only
```

That mode verifies machine/generated metadata without requiring every release document to have been updated in the same intermediate commit. Normal CI and release verification must use the full audit.

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

These cover npm lock top/root versions, Cargo manifest/package-lock extraction, Cargo package blocks at normal boundaries/end-of-file, SemVer agreement, tag mismatch behavior, synchronized release-document identity, and stale release-document rejection.

## Release gates

`.github/workflows/release-lockfile-consistency.yml` runs the direct dependency-lock auditor for version tags/manual dispatches. The main tag-driven `.github/workflows/release.yml` also runs repository policy gates and the full lock-aware version checker before dependency installation/artifact production.

These workflows are intentionally evidence-oriented. They do not silently regenerate an invalid candidate during release verification. If a lock or current release identity is stale, the candidate must be fixed first.

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
DICELAB_EXPECT_VERSION=v2.18.12 npm run version:check
```

Use a network-enabled environment with the normal package managers. Do not hand-edit transitive lockfile entries simply to satisfy an audit.

## Lockfile generation workflow

`.github/workflows/lockfiles.yml` is the package-manager generation path. It currently:

1. runs on `main`, `release/**`, and manual dispatch;
2. watches npm manifests/locks plus frontend, Cargo, and Tauri application-version sources;
3. regenerates `package-lock.json` with npm;
4. regenerates `src-tauri/Cargo.lock` with Cargo;
5. validates Cargo's generated graph using locked `cargo metadata`;
6. runs the metadata-only application-version audit against the newly generated files;
7. runs `git diff --check`;
8. commits only changed lockfiles;
9. rebases against the active branch;
10. pushes to that branch, or publishes the exact generated commit to `automation/lockfiles` for `main` / a branch-specific `automation/lockfiles-*` fallback when direct push is rejected.

The generator therefore cannot publish locks that still carry an older DiceLab package version than the current manifests/configuration, while normal CI separately requires release-facing candidate identity to be synchronized.

## Current 2.18.12 lock state

Generation has completed for the active 2.18.12 preparation branch.

Observed npm state:

```text
package.json                         2.18.12
package-lock.json top-level          2.18.12
package-lock.json packages[""]       2.18.12
```

Observed Rust state:

```text
src-tauri/Cargo.toml package         2.18.12
src-tauri/Cargo.lock dicelab package 2.18.12
```

The generated DiceLab Cargo package block includes the direct dependencies:

```text
rand
regex
serde
serde_json
tauri
tauri-build
tauri-plugin-dialog
tauri-plugin-fs
```

This closes the previously documented stale generated-lock blocker. It does **not** replace observed `npm ci`, locked Rust test/Clippy, dependency audit, or release-candidate CI evidence.

## Current release rule

A configured generation workflow is not proof that the candidate is reproducible. Release readiness requires all of the following:

- generated npm/Cargo locks are visibly committed on the exact candidate commit;
- npm top/root package versions match the candidate version;
- the DiceLab Cargo-lock package version matches the candidate version;
- all current direct dependencies, including `tauri-plugin-dialog` and `tauri-plugin-fs`, are represented in the generated Cargo graph;
- the dependency-free structural audit passes;
- the full lock/version/release-document audit passes;
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
