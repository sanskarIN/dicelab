# DiceLab Current Release Blockers

Last reviewed: 2026-08-19

This file separates **implemented product/repository work** from **release evidence that still must be observed**. It should be updated only when a blocker is actually resolved on the intended candidate commit.

## Blocker 1 — Rust dependency lockfile

Current manifest requirement introduced by native desktop save dialogs:

```toml
tauri-plugin-dialog = "2.7.2"
```

The latest observed `main` branch still does **not** contain `tauri-plugin-dialog` in `src-tauri/Cargo.lock`. The dependency is used by `src-tauri/src/lib.rs`, so the committed Rust dependency graph is not yet reproducibly complete.

The lockfile workflow has been hardened to:

- trigger on `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, and its own workflow definition;
- regenerate npm and Cargo lockfiles with the package managers;
- verify the generated Cargo lock with `cargo metadata --locked --no-deps --format-version 1`;
- run `git diff --check` before committing generated lockfiles;
- attempt a direct `main` update and otherwise publish the generated commit on `automation/lockfiles`.

No generated lockfile commit or fallback `automation/lockfiles` branch has been observed yet in the current audit, so this blocker remains open.

Required sequence on a network-enabled runner:

```bash
cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

Then run:

```bash
node scripts/check-lockfile-consistency.mjs
```

Do not hand-edit transitive Cargo lock entries.

## Blocker 2 — Observed full browser E2E

The production real-browser journey is implemented, but release evidence requires an observed successful run on infrastructure that permits the required local preview/browser navigation.

Required evidence:

- exact source commit;
- browser/runtime versions;
- successful E2E workflow/run identifier or preserved local output;
- no skipped primary journey steps.

## Blocker 3 — Observed parser fuzz campaign

The cargo-fuzz harness and scheduled/manual workflow are implemented.

Release evidence still requires an observed bounded campaign on the intended candidate, with no unresolved crash/invariant artifact.

Any discovered reproducible case should become a deterministic Rust regression before release.

## Blocker 4 — Release-candidate benchmark record

`npm run bench` is implemented, but timing values are only meaningful when recorded with:

- exact source commit;
- hardware;
- operating system;
- Node/npm versions;
- complete benchmark output.

The release candidate needs an actual recorded run rather than an assumed performance claim.

## Blocker 5 — Platform candidate builds

Windows, macOS, and Linux candidate artifacts must each be built from the intended source commit and smoke-tested.

For every supported desktop candidate verify at least:

- application launches;
- secure roll path works;
- deterministic seeded reference behavior matches the web companion;
- settings persist;
- English/Hindi switching persists;
- native History CSV save works;
- native History JSON save works;
- native backup save works;
- canceling native save creates no file and no false error;
- backup restore works;
- About/version/contact data is correct;
- reduced-motion/keyboard behavior is usable;
- native errors do not expose a private selected filesystem path.

## Blocker 6 — Accessibility/manual localization review

Automated tests do not replace candidate review.

Still required:

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

Release readiness still requires observed successful candidate runs plus review of:

- secret scanning;
- CodeQL/code scanning;
- dependency alerts;
- repository security settings;
- release workflow permissions.

## Blocker 8 — Real candidate screenshots

README/release screenshots must be captured from verified candidate builds rather than mocked or development-only representations.

Required minimum set:

- Dice Studio;
- History;
- Probability;
- Settings;
- representative Hindi interface.

## Blocker 9 — Signing/notarization status

Signing/notarization should be completed where credentials/infrastructure are available.

If not configured, release documentation must state that accurately. Never commit signing credentials or private keys.

## Blocker 10 — Artifact/checksum/provenance review

Before publishing the draft release:

- download produced artifacts;
- verify SHA-256 checksums;
- inspect expected package contents;
- verify `RELEASE-METADATA.json` source/tag/run identity;
- confirm release notes match `CHANGELOG.md`;
- confirm signing claims match reality.

## Final code-audit findings closed before candidate verification

The final source audit on 2026-08-19 closed additional issues before release evidence is collected:

- persisted keep/drop history now validates the **exact expected kept indices**, not only the number of kept dice;
- backup imports inherit the same semantic keep/drop integrity check and have dedicated regression coverage;
- CSV formula-injection protection now catches whitespace-prefixed formula markers in untrusted text fields;
- CSV numeric total/modifier fields remain numeric instead of being unnecessarily apostrophe-prefixed when negative;
- the history-limit UI now emits a bounded integer immediately instead of allowing a fractional live value that would normalize differently after reload;
- lockfile automation now validates its generated diff and generated locked Cargo metadata before committing.

These fixes are implementation work, not substitutes for the candidate evidence listed above.

## Final publication gate

`v0.1.0` should be published only after the candidate evidence is complete enough for a maintainer to choose **APPROVE** in a filled copy of:

- [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md)

## Handoff references

- [`../what_changed.md`](../what_changed.md)
- [`handoffs/README.md`](handoffs/README.md)
- [`lockfile-policy.md`](lockfile-policy.md)
- [`release.md`](release.md)
- [`testing.md`](testing.md)
- [`../ROADMAP.md`](../ROADMAP.md)
