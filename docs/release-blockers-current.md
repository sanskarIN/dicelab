# DiceLab Current Release Blockers

Current candidate: **2.0.12** (`v2.0.12`)

Last reviewed: 2026-08-19

This file separates **implemented product/repository work** from **release evidence that still must be observed**. It should be updated only when a blocker is actually resolved on the intended candidate commit.

## Blocker 1 — Generated dependency lockfiles

The authoritative manifests/configuration are now prepared for 2.0.12, but both generated dependency locks remain on the previous application version and the Rust lock is also missing the native dialog dependency.

### npm lock state

Current observed state:

```text
package.json version                  2.0.12
package-lock.json top-level version   0.1.0
package-lock.json packages[""]        0.1.0
```

The dependency ranges remain represented, but npm must regenerate its lock metadata before the 2.0.12 candidate can make a reproducibility/version-synchronization claim.

### Cargo lock state

`src-tauri/Cargo.toml` declares package version `2.0.12` and includes:

```toml
tauri-plugin-dialog = "2.7.2"
```

The directly inspected DiceLab package block in `src-tauri/Cargo.lock` still reads:

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

Therefore the generated Rust lock is stale in two independently observable ways:

- DiceLab's lock package version is still `0.1.0` rather than `2.0.12`;
- `tauri-plugin-dialog` is absent from DiceLab's direct dependency list/lock graph.

The lockfile workflow is configured to:

- trigger on `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, and its own workflow definition;
- regenerate npm and Cargo lockfiles with the package managers;
- verify the generated Cargo lock with `cargo metadata --locked --no-deps --format-version 1`;
- run `git diff --check` before committing generated lockfiles;
- attempt a direct `main` update and otherwise publish the generated commit on `automation/lockfiles`.

The latest commit check still shows no generated `build: lock application dependencies` commit for the 2.0.12 bump, and the latest branch check still shows no `automation/lockfiles` fallback branch. This blocker remains open.

### Stronger version gate now in place

`scripts/check-version-sync.mjs` now includes generated lock metadata in the version contract. It verifies:

- `package.json`;
- `package-lock.json` top-level version;
- `package-lock.json packages[""]` version;
- `src/config/app.ts`;
- `src-tauri/Cargo.toml`;
- DiceLab's `src-tauri/Cargo.lock` package version;
- `src-tauri/tauri.conf.json`;
- optional release tag/version agreement.

Its focused parser/agreement suite was independently exercised after the hardening and passed **14/14 tests**. The full repository `version:check` is expected to fail while the two generated locks remain at `0.1.0`; that failure is now intentional protection rather than an undocumented inconsistency.

Required sequence on a network-enabled runner:

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

Do not hand-edit Cargo's transitive lock entries.

## Blocker 2 — Observed full browser E2E

The production real-browser journey is implemented, but 2.0.12 release evidence requires an observed successful run on infrastructure that permits the required local preview/browser navigation.

Required evidence:

- exact 2.0.12 source commit;
- browser/runtime versions;
- successful E2E workflow/run identifier or preserved local output;
- no skipped primary journey steps.

## Blocker 3 — Observed parser fuzz campaign

The cargo-fuzz harness and scheduled/manual workflow are implemented.

2.0.12 release evidence still requires an observed bounded campaign on the intended candidate, with no unresolved crash/invariant artifact.

Any discovered reproducible case should become a deterministic Rust regression before release.

## Blocker 4 — 2.0.12 benchmark record

`npm run bench` is implemented, but timing values are only meaningful when recorded with:

- exact source commit;
- hardware;
- operating system;
- Node/npm versions;
- complete benchmark output.

The 2.0.12 candidate needs an actual recorded run rather than an assumed performance claim.

## Blocker 5 — Platform candidate builds

Windows, macOS, and Linux 2.0.12 candidate artifacts must each be built from the intended source commit and smoke-tested.

For every supported desktop candidate verify at least:

- application launches;
- About/Settings show version `2.0.12`;
- secure roll path works;
- deterministic seeded reference behavior matches the web companion;
- settings persist;
- English/Hindi switching persists;
- native History CSV save works;
- native History JSON save works;
- native backup save works;
- canceling native save creates no file and no false error;
- backup restore works;
- contact/project data is correct;
- reduced-motion/keyboard behavior is usable;
- native errors do not expose a private selected filesystem path.

## Blocker 6 — Accessibility/manual localization review

Automated tests do not replace candidate review.

Still required for the 2.0.12 build:

- keyboard-only primary journey;
- focus visibility/order;
- modal focus trapping/restoration;
- 200% text scaling;
- reduced-motion review;
- representative screen-reader labels/landmarks;
- English layout review;
- Hindi layout review.

## Blocker 7 — Repository/security evidence

The repository contains executable policy audits for:

- desktop capabilities;
- Tauri CSP/remote IPC;
- offline CSP network sources;
- localized formatting boundary;
- native runtime boundary;
- native command contract;
- dependency lock consistency;
- generated-lock-aware application version agreement;
- exhaustive tracked-file documentation inventory.

The tag-driven release workflow now also runs documentation inventory and repository policy gates directly before artifact production. Release readiness still requires observed successful 2.0.12 candidate runs plus review of:

- secret scanning;
- CodeQL/code scanning;
- dependency alerts;
- repository security settings;
- release workflow permissions.

## Blocker 8 — Real 2.0.12 candidate screenshots

README/release screenshots must be captured from verified candidate builds rather than mocked or development-only representations.

Required minimum set:

- Dice Studio;
- History;
- Probability;
- Settings showing 2.0.12;
- representative Hindi interface.

## Blocker 9 — Signing/notarization status

Signing/notarization should be completed where credentials/infrastructure are available.

If not configured, 2.0.12 release documentation must state that accurately. Never commit signing credentials or private keys.

## Blocker 10 — Artifact/checksum/provenance review

Before publishing the 2.0.12 draft release:

- download produced artifacts;
- verify SHA-256 checksums;
- inspect expected package contents;
- verify `RELEASE-METADATA.json` reports tag `v2.0.12`, the exact source commit, and workflow identity;
- confirm release notes match `CHANGELOG.md`;
- confirm signing claims match reality.

## Final code-audit findings closed before candidate verification

The final source/release audit on 2026-08-19 closed additional issues before release evidence is collected:

- persisted keep/drop history validates the **exact expected kept indices**, not only the number of kept dice;
- backup imports inherit the same semantic keep/drop integrity check and have dedicated regression coverage;
- selected backup files larger than the 5,000,000-byte contract are rejected from `File.size` **before** `File.text()` reads them, while the existing UTF-8 byte check still runs after reading as defense in depth;
- CSV formula-injection protection catches whitespace-prefixed formula markers in untrusted text fields;
- CSV numeric total/modifier fields remain numeric instead of being unnecessarily apostrophe-prefixed when negative;
- the history-limit UI emits a bounded integer immediately instead of allowing a fractional live value that would normalize differently after reload;
- the visible command-palette shortcut advertises `Ctrl/⌘ K`, matching the implemented Ctrl-or-Command handler;
- lockfile automation validates its generated diff and generated locked Cargo metadata before committing;
- authoritative application manifest/config metadata has been advanced to `2.0.12`;
- version synchronization now includes generated npm/Cargo application package versions;
- the release workflow directly gates artifact creation on documentation inventory, policy checks, lock/version checks, release-verifier self-tests, and explicit job timeouts;
- roadmap, governance, changelog, release guide, README, data contracts, automation reference, and release-evidence template now consistently target the 2.0.12 candidate.

These fixes are implementation/configuration work, not substitutes for the candidate execution evidence listed above.

## Final publication gate

`v2.0.12` should be published only after the candidate evidence is complete enough for a maintainer to choose **APPROVE** in a filled copy of:

- [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md)

## Handoff references

- [`../what_changed.md`](../what_changed.md)
- [`handoffs/README.md`](handoffs/README.md)
- [`lockfile-policy.md`](lockfile-policy.md)
- [`release.md`](release.md)
- [`testing.md`](testing.md)
- [`../ROADMAP.md`](../ROADMAP.md)
