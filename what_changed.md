# DiceLab — Current Work Handoff

Last updated: 2026-08-19

This file is the current continuation entry point. Detailed historical implementation work remains preserved in the dated handoffs and the deep documentation set; this file records the **latest audited repository state** and the exact remaining release gates.

## Detailed handoff history

Read in order:

1. [`docs/handoffs/2026-08-19-pre-native-exports.md`](docs/handoffs/2026-08-19-pre-native-exports.md) — earlier large implementation, verification, browser-E2E, security, and release-engineering wave.
2. [`docs/handoffs/2026-08-19-native-localization.md`](docs/handoffs/2026-08-19-native-localization.md) — reviewed Hindi locale, persisted language, locale formatting, native save dialogs, parser fuzzing, and lockfile workflow hardening.
3. [`docs/handoffs/2026-08-19-policy-hardening.md`](docs/handoffs/2026-08-19-policy-hardening.md) — executable repository security/architecture policies, localization lifecycle tests, collaboration metadata, lock consistency, and release evidence tooling.
4. [`docs/handoffs/2026-08-19-documentation-completion.md`](docs/handoffs/2026-08-19-documentation-completion.md) — deep documentation architecture, complete file catalog, documentation-inventory enforcement, contributor/README/ADR/governance corrections.

The handoff index is [`docs/handoffs/README.md`](docs/handoffs/README.md).

## Product implementation state

The code-completable product scope is implemented:

- Rust + Tauri desktop application and React/Vite web companion;
- bounded dice expression parser with modifiers and `kh`/`kl`/`dh`/`dl` selections;
- secure native/browser randomness and deterministic cross-runtime seeded mode;
- localized roll workspace, presets, history, statistics, probability, Settings, onboarding, command palette, and About UI;
- reviewed English/Hindi catalogs, persisted locale preference, document `lang`, localized built-ins, and explicit presentation formatting;
- bounded local persistence and backup schema-v1 restore;
- CSV/JSON history export and JSON backup export;
- Tauri-native OS save dialogs through the dedicated bounded `save_text_export` Rust command with browser Blob fallback;
- privacy-safe local structured logging;
- parser regression/generated/adversarial tests plus a Rust fuzz target;
- production-bundle real-browser CDP smoke automation;
- executable performance benchmarks;
- cross-platform draft release packaging with provenance metadata and SHA-256 checksums;
- capability/CSP/offline-network/runtime/native-command/localized-formatting/lock consistency policy audits;
- structured GitHub issue/PR/support/ownership/funding metadata.

## Final audit fixes completed in this continuation

### Persisted keep/drop semantic integrity

Previously a persisted or imported keep/drop roll could pass validation if it had the correct **number** of kept dice and a self-consistent total even when the wrong actual dice were marked kept.

Now `src/domain/persistence.ts` reconstructs values by original die index, computes the expected keep/drop selection with the same deterministic selection engine used by live rolls, and rejects any mismatched `kept` mask.

Regression coverage exists in both local-storage recovery and backup-import tests.

Commits:

- `445abada` — `fix: validate persisted keep drop selections`
- `b1a1424b` — `test: reject forged persisted keep drop masks`
- `3ac4c496` — `test: reject forged backup selection masks`

### Spreadsheet-safe CSV without breaking numeric columns

CSV formula neutralization was hardened in two stages:

- untrusted formula-like values preceded by whitespace are now detected;
- formula neutralization is limited to untrusted text fields (`id` and `seed`) so generated negative `total` and `modifier` values remain true numeric CSV cells instead of being converted to apostrophe-prefixed text.

Regression coverage includes direct formula markers, whitespace-prefixed formula markers, imported formula-like IDs, quoted formula content, and negative numeric totals/modifiers.

Commits:

- `50d32006` — `fix: neutralize whitespace prefixed csv formulas`
- `1760442a` — `test: cover whitespace prefixed csv formulas`
- `2b6b8174` — `fix: preserve numeric csv columns`
- `05038f95` — `test: preserve numeric csv semantics`

### History-limit live-state normalization

The Settings number field previously allowed a manually entered fractional history limit to enter live application state even though persisted settings require a safe integer. The same setting could therefore behave differently before and after reload.

The field now converts finite input to an integer immediately with `Math.trunc()` and clamps it to the supported 10–5,000 range.

Commits:

- `86cb41cd` — `fix: keep history limit integer bounded`
- `6d2cb32a` — `test: normalize fractional history limits`

### Dependency-lock workflow hardening

`.github/workflows/lockfiles.yml` now:

- triggers on both manifests **and both lockfiles**, plus the workflow itself;
- regenerates npm/Cargo lockfiles with the package managers;
- disables unnecessary npm audit/fund network work during lock generation;
- verifies generated Cargo metadata with `--locked`;
- runs `git diff --check` before committing;
- retains the existing direct-main/fallback-branch publication behavior;
- uses a bounded job timeout.

Commits:

- `0a4507e8` — `ci: verify generated dependency lockfiles`
- `99680f5c` — `ci: revalidate direct lockfile edits`

## Documentation state

The deep documentation system remains the canonical reference. Start at [`docs/README.md`](docs/README.md).

Key references:

- [`docs/architecture.md`](docs/architecture.md) — system architecture;
- [`docs/application-flows.md`](docs/application-flows.md) — startup, roll, history, probability, localization, export, backup, storage, error, and release flows;
- [`docs/data-contracts.md`](docs/data-contracts.md) — domain/persistence/backup/native/locale/version/lockfile contracts;
- [`docs/code-reference.md`](docs/code-reference.md) — maintainer module/change-routing reference;
- [`docs/automation-reference.md`](docs/automation-reference.md) — commands, scripts, workflows, and evidence semantics;
- [`docs/repository-file-reference.md`](docs/repository-file-reference.md) — exhaustive Git-tracked file inventory;
- [`docs/repository-policy-gates.md`](docs/repository-policy-gates.md) — executable security/architecture gates;
- [`docs/release.md`](docs/release.md) — release process;
- [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md) — candidate evidence record;
- [`docs/release-blockers-current.md`](docs/release-blockers-current.md) — exact current release blockers.

No new tracked file was introduced by this continuation, so the exhaustive file-reference inventory does not require a new path entry.

## Current first release blocker — still open

`src-tauri/Cargo.toml` declares:

```toml
tauri-plugin-dialog = "2.7.2"
```

A fresh audit of the current `main` branch still finds **no `tauri-plugin-dialog` package entry** in `src-tauri/Cargo.lock`.

Recent commit history also does not yet show the workflow-generated `build: lock application dependencies` commit, and no `automation/lockfiles` fallback branch was observed.

Therefore the Rust dependency graph is **not yet eligible for a reproducibility claim**. Do not hand-edit Cargo's transitive lock entries.

Required network-enabled resolution:

```bash
cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
node ../scripts/check-lockfile-consistency.mjs
```

The strengthened lockfile workflow is intended to perform the generation/validation automatically when GitHub Actions executes successfully, but workflow configuration alone is not release evidence.

## Remaining evidence-gated release work

The following are intentionally still open until observed on the **same intended candidate commit**:

- locked Rust test/Clippy success after the Cargo lockfile is regenerated;
- complete frontend unit/integration/lint/format/build verification;
- repository documentation/security/policy audit success;
- full production real-browser E2E success;
- bounded parser fuzz campaign with no unresolved finding;
- candidate benchmark record with machine/runtime metadata;
- clean Windows/macOS/Linux desktop builds and smoke tests;
- native CSV/JSON/backup save/cancel/failure smoke on each desktop platform;
- English/Hindi visual and accessibility review;
- keyboard-only, representative screen-reader, 200% text, focus, and reduced-motion review;
- CodeQL/dependency/repository-security results review;
- real screenshots from verified candidate builds;
- signing/notarization where available, or accurate unsigned-release documentation;
- artifact checksum/provenance/content review;
- maintainer approval and publication of the draft `v0.1.0` release.

Do not mark any of those complete from workflow definitions alone. Use [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md) and preserve the exact source commit/run/platform evidence.

## Continuation rule

Do not repeat completed implementation work unless a new defect is found. Continue from the first unresolved release gate:

1. regenerate and commit the current Cargo lockfile;
2. observe locked Rust quality checks;
3. observe frontend/repository/browser/fuzz checks on the same candidate;
4. produce and smoke-test Windows/macOS/Linux candidates;
5. record benchmark/accessibility/localization/screenshot/security/provenance evidence;
6. publish only after the evidence template is complete enough for explicit maintainer approval.
