# DiceLab — Current Work Handoff

Last updated: 2026-08-19

Current release-preparation target: **2.0.12** (`v2.0.12`)

This file is the current continuation entry point. It records the final implementation/release-hardening state, what was actually verified, and what still requires generated artifacts or observed candidate evidence.

## Historical handoffs

Detailed earlier work remains preserved in:

1. [`docs/handoffs/2026-08-19-pre-native-exports.md`](docs/handoffs/2026-08-19-pre-native-exports.md)
2. [`docs/handoffs/2026-08-19-native-localization.md`](docs/handoffs/2026-08-19-native-localization.md)
3. [`docs/handoffs/2026-08-19-policy-hardening.md`](docs/handoffs/2026-08-19-policy-hardening.md)
4. [`docs/handoffs/2026-08-19-documentation-completion.md`](docs/handoffs/2026-08-19-documentation-completion.md)

The handoff index is [`docs/handoffs/README.md`](docs/handoffs/README.md).

## Product implementation state

The code-completable DiceLab product scope is implemented:

- Rust + Tauri desktop application and React/Vite web companion;
- bounded dice parser with modifiers and `kh`/`kl`/`dh`/`dl` selection semantics;
- secure native/browser randomness;
- deterministic TypeScript/Rust seeded parity;
- localized Roll, Presets, History, Statistics, Probability, Settings, onboarding, command palette, and About surfaces;
- reviewed English/Hindi catalogs with persisted locale and locale-aware presentation formatting;
- bounded local history/settings/preset persistence;
- exact persisted keep/drop semantic validation;
- schema-v1 backup export/import with strict validation and pre-read file-size rejection;
- CSV/JSON history export with spreadsheet-formula protection scoped to untrusted text fields;
- Tauri-native OS save dialogs through the bounded `save_text_export` command with browser Blob fallback;
- privacy-safe structured local diagnostics;
- parser regression/generated/adversarial tests and Rust fuzz target;
- production-bundle CDP real-browser E2E tooling;
- executable benchmarks;
- dependency-free documentation/security/policy/version/release audits;
- cross-platform draft-release packaging with provenance metadata and SHA-256 checksums;
- structured repository issue/PR/support/ownership/funding/governance metadata.

## Earlier final-audit correctness fixes retained

The preceding final audit closed concrete product defects before this 2.0.12 release pass:

- persisted/imported keep/drop rolls now verify the exact expected kept-index set rather than only the kept count;
- oversized backup files are rejected from `File.size` before `File.text()` is allowed to read them;
- decoded backup text still receives the exact UTF-8 5,000,000-byte check as defense in depth;
- CSV formula markers are detected after optional leading whitespace in untrusted `id`/`seed` values;
- generated negative total/modifier CSV values stay numeric;
- live history-limit input is truncated/clamped to the persisted safe-integer contract;
- the command shortcut hint is `Ctrl/⌘ K`, matching the actual cross-platform handler;
- the lockfile generation workflow verifies generated locked Cargo metadata and generated diff hygiene.

Those details are also recorded in `CHANGELOG.md`, `docs/application-flows.md`, `docs/data-contracts.md`, and `docs/release-blockers-current.md`.

## 2.0.12 version preparation completed

The four authoritative application manifest/config sources were moved from `0.1.0` to `2.0.12` in granular commits:

- `294f708e` — `release: bump npm package to 2.0.12`
- `5d49ae30` — `release: expose app version 2.0.12`
- `734f6e73` — `release: bump Rust package to 2.0.12`
- `dcb77a6b` — `release: set Tauri version 2.0.12`

Current intended tag:

```text
v2.0.12
```

No tag or published release has been created from this preparation state because generated locks and release evidence remain incomplete.

## Lock-aware version gate added

The previous version checker could report a synchronized application even if generated lock metadata still contained an older package version. That release gap is closed.

`scripts/check-version-sync.mjs` now reads and requires exact semantic-version agreement across:

1. `package.json`
2. `package-lock.json` top-level `version`
3. `package-lock.json` root `packages[""]` version
4. `src/config/app.ts`
5. `src-tauri/Cargo.toml`
6. the `[[package]]` block named `dicelab` in `src-tauri/Cargo.lock`
7. `src-tauri/tauri.conf.json`

When `DICELAB_EXPECT_VERSION` is supplied, the normalized release tag/version must also match.

Relevant commits:

- `086eac27` — `fix: include lockfile package versions in version audit`
- `876d7f56` — `fix: parse Cargo lock package blocks portably`
- `428be145` — `test: cover generated lock version metadata`
- `dd78191a` — `fix: handle Cargo package section end of file`
- `1c1c6629` — `test: cover Cargo package section at eof`

The focused version-parser/agreement test suite was independently exercised after these changes and passed **14 tests, 0 failures**.

The full repository version check is intentionally expected to fail until the generated npm and Cargo locks are regenerated to 2.0.12. That failure is a release-protection mechanism, not a hidden defect.

## 2.0.12 release workflow hardened

The tag workflow was strengthened so a draft release cannot depend only on separately scheduled/path-filtered repository audits.

Commit:

- `fa3f18c9` — `ci: gate 2.0.12 release on repository audits`

The web artifact job now directly requires, before artifact production:

- secret scanner self-test and repository secret audit;
- documentation link self-test/audit;
- exhaustive tracked-file inventory self-test/audit;
- repository policy self-tests;
- `npm run policy:all`, including direct dependency-lock consistency;
- browser E2E infrastructure self-test;
- version-audit self-test;
- release tag/version agreement using the lock-aware version checker;
- release-verifier self-test;
- locked npm install;
- formatting, lint, unit/integration tests, production build, and real-browser E2E.

Explicit job timeouts were added:

```text
web       30 minutes
desktop   45 minutes per platform
release   15 minutes
```

Desktop artifacts still require locked Rust formatting/tests/Clippy and Tauri builds on Windows, macOS, and Linux. The final job still creates only a **draft** release with ZIPs, `RELEASE-METADATA.json`, and `SHA256SUMS.txt`.

Human artifact/platform/accessibility/signing/provenance review remains mandatory before publication.

## 2.0.12 release documentation synchronized

The active release-facing documents were moved off the obsolete pre-1.0/`v0.1.0` assumptions and synchronized to the 2.0.12 candidate:

- `9f234207` / `8f935f9c` — release guide prepared for 2.0.12 and then updated for the lock-aware version gate;
- `067da245` — roadmap targets 2.0.12 and separates implemented work from candidate evidence;
- `1c7fd808` / `f7408f38` — current blocker ledger retargeted to 2.0.12 and then updated with exact lock mismatch evidence;
- `435a070a` — repository governance/milestones aligned with the 2.0.12 release line;
- `d1433abb` — changelog staged as `[2.0.12] - 2026-08-19 (release candidate)` while retaining `[Unreleased]` and explicitly not claiming publication;
- `b744b2f6` — data/version/dependency contracts made generated-lock aware;
- `c2b67503` — automation reference updated for generated-lock version checking and stronger release workflow;
- `bfa84119` — release-candidate evidence template strengthened for 2.0.12 version/lock/policy/platform evidence;
- `b4edc949` — README now surfaces 2.0.12 candidate status and current publication blockers.

No new tracked path was introduced, so the exhaustive repository-file reference does not need a new path entry for this continuation.

## Exact generated-lock state — blocker remains open

The latest direct checks still show both generated application lock versions at `0.1.0`.

### npm

Observed `package-lock.json` header/root metadata:

```text
package.json version                  2.0.12
package-lock.json top-level version   0.1.0
package-lock.json packages[""]        0.1.0
```

### Cargo

Observed DiceLab package block in `src-tauri/Cargo.lock`:

```toml
[[package]]
name = "dicelab"
version = "0.1.0"
dependencies = [
 "rand",
 "regex",
 "serde",
 "serde_json",
 "tauri",
 "tauri-build",
]
```

Current manifest requires:

```toml
tauri-plugin-dialog = "2.7.2"
```

Therefore `src-tauri/Cargo.lock` is stale because:

- the DiceLab package version is `0.1.0`, not `2.0.12`;
- `tauri-plugin-dialog` is missing from the locked DiceLab dependency graph.

The most recent commit search still does **not** show the workflow-generated commit:

```text
build: lock application dependencies
```

The most recent branch search still finds no:

```text
automation/lockfiles
```

Do not hand-edit Cargo's transitive graph.

Required package-manager resolution on a network-enabled runner:

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund

cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
cd ..

npm run policy:lockfiles
DICELAB_EXPECT_VERSION=v2.0.12 npm run version:check
```

The existing lockfile workflow is configured to perform the generation automatically and either commit to `main` or publish the exact generated commit on `automation/lockfiles` if direct main updates are rejected. No successful generated output from that mechanism has yet been observed in this continuation.

## What is actually verified in this continuation

Observed/verified directly:

- authoritative manifest/config version edits are committed at 2.0.12;
- stale npm lock versions are directly observed as 0.1.0;
- stale Cargo DiceLab package version is directly observed as 0.1.0;
- Cargo DiceLab lock dependency list directly lacks `tauri-plugin-dialog`;
- no generated lockfile commit appears in recent commits;
- no `automation/lockfiles` branch appears in branch search;
- the strengthened version-parser/agreement tests passed 14/14 in the isolated execution performed during this work;
- release/docs/governance source changes are committed to `main`.

Not claimed as observed 2.0.12 release evidence:

- full clean-checkout npm install/test/build;
- full repository CI green state;
- locked Rust test/Clippy success with regenerated Cargo lock;
- production real-browser E2E success;
- bounded parser fuzz campaign result;
- benchmark output for the 2.0.12 candidate;
- Windows/macOS/Linux packaged candidate smoke;
- native save-dialog platform smoke;
- accessibility/manual localization candidate review;
- CodeQL/dependency/repository-security review;
- real candidate screenshots;
- signing/notarization;
- final artifact checksum/provenance verification;
- explicit maintainer APPROVE decision;
- publication of `v2.0.12`.

The available local execution environment cannot perform a clean GitHub clone because its direct GitHub DNS/network path is unavailable, so it must not be used to claim full-repository verification.

## Current release gate

The first unresolved gate is generated dependency-lock synchronization.

Once the locks are regenerated, continue in this order:

1. confirm `package-lock.json` top/root versions are `2.0.12`;
2. confirm the DiceLab `Cargo.lock` package version is `2.0.12` and includes `tauri-plugin-dialog`;
3. run/observe `DICELAB_EXPECT_VERSION=v2.0.12 npm run version:check`;
4. run/observe dependency/policy/documentation/secret checks on the same candidate;
5. run/observe frontend build/tests and real-browser E2E;
6. run/observe locked Rust format/test/Clippy and fuzz campaign;
7. record benchmark evidence;
8. build/smoke Windows/macOS/Linux artifacts;
9. complete native-save, English/Hindi, accessibility, security, screenshot, signing, checksum, and provenance review;
10. fill [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md);
11. create `v2.0.12` only from the verified candidate commit;
12. keep the generated GitHub release as a draft until explicit maintainer **APPROVE**.

## Canonical references

- [`README.md`](README.md)
- [`CHANGELOG.md`](CHANGELOG.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`docs/README.md`](docs/README.md)
- [`docs/release.md`](docs/release.md)
- [`docs/release-blockers-current.md`](docs/release-blockers-current.md)
- [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md)
- [`docs/data-contracts.md`](docs/data-contracts.md)
- [`docs/automation-reference.md`](docs/automation-reference.md)
- [`docs/repository-governance.md`](docs/repository-governance.md)
- [`docs/lockfile-policy.md`](docs/lockfile-policy.md)
- [`docs/testing.md`](docs/testing.md)
