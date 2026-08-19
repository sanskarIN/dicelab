# DiceLab Current Release Blockers

Current candidate: **2.0.12** (`v2.0.12`)

Last reviewed: 2026-08-19

This file separates **implemented product/repository work** from **release evidence that still must be observed**. It should be updated only when a blocker is actually resolved on the intended candidate commit.

## Blocker 1 — Generated dependency lockfiles

The authoritative version metadata is now being prepared for 2.0.12, but the generated dependency locks have not yet been observed regenerated for the new manifests.

### npm lock state

`package.json` declares version `2.0.12`, while the latest observed `package-lock.json` root metadata still reports `0.1.0`.

The dependency ranges remain represented, but the generated npm lock metadata must be refreshed by npm before the 2.0.12 candidate can make a clean reproducibility claim.

### Cargo lock state

`src-tauri/Cargo.toml` now declares package version `2.0.12` and includes:

```toml
tauri-plugin-dialog = "2.7.2"
```

The latest observed `main` branch still does **not** contain `tauri-plugin-dialog` in `src-tauri/Cargo.lock`. The dependency is used by `src-tauri/src/lib.rs`, so the committed Rust dependency graph is not reproducibly complete for 2.0.12.

The lockfile workflow is configured to:

- trigger on `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, and its own workflow definition;
- regenerate npm and Cargo lockfiles with the package managers;
- verify the generated Cargo lock with `cargo metadata --locked --no-deps --format-version 1`;
- run `git diff --check` before committing generated lockfiles;
- attempt a direct `main` update and otherwise publish the generated commit on `automation/lockfiles`.

No generated `build: lock application dependencies` commit has yet been observed for this 2.0.12 bump, so this blocker remains open.

Required sequence on a network-enabled runner:

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund

cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
cd ..

npm run policy:lockfiles
npm run version:check
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
- dependency lock consistency.

Release readiness still requires observed successful 2.0.12 candidate runs plus review of:

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

The final source audit on 2026-08-19 closed additional issues before release evidence is collected:

- persisted keep/drop history now validates the **exact expected kept indices**, not only the number of kept dice;
- backup imports inherit the same semantic keep/drop integrity check and have dedicated regression coverage;
- selected backup files larger than the 5,000,000-byte contract are rejected from `File.size` **before** `File.text()` reads them, while the existing UTF-8 byte check still runs after reading as defense in depth;
- CSV formula-injection protection now catches whitespace-prefixed formula markers in untrusted text fields;
- CSV numeric total/modifier fields remain numeric instead of being unnecessarily apostrophe-prefixed when negative;
- the history-limit UI now emits a bounded integer immediately instead of allowing a fractional live value that would normalize differently after reload;
- the visible command-palette shortcut now advertises `Ctrl/⌘ K`, matching the implemented Ctrl-or-Command handler;
- lockfile automation validates its generated diff and generated locked Cargo metadata before committing;
- authoritative application version metadata has been advanced to `2.0.12`.

These fixes are implementation work, not substitutes for the candidate evidence listed above.

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
