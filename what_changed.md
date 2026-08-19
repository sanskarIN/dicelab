# DiceLab — Current Work Handoff

Last updated: 2026-08-19

This file is the current continuation entry point. Detailed completed work is preserved in dated handoffs so this file can stay focused on the latest repository state instead of duplicating every historical commit.

## Detailed handoff history

Read in order:

1. [`docs/handoffs/2026-08-19-pre-native-exports.md`](docs/handoffs/2026-08-19-pre-native-exports.md) — earlier large implementation, verification, browser-E2E, security, and release-engineering wave.
2. [`docs/handoffs/2026-08-19-native-localization.md`](docs/handoffs/2026-08-19-native-localization.md) — reviewed Hindi locale, persisted language, locale formatting, native save dialogs, parser fuzzing, and lockfile workflow hardening.
3. [`docs/handoffs/2026-08-19-policy-hardening.md`](docs/handoffs/2026-08-19-policy-hardening.md) — executable repository security/architecture policies, localization lifecycle tests, collaboration metadata, lock consistency, and release evidence tooling.
4. [`docs/handoffs/2026-08-19-documentation-completion.md`](docs/handoffs/2026-08-19-documentation-completion.md) — deep documentation architecture, complete file catalog, documentation-inventory enforcement, contributor/README/ADR/governance corrections.

The handoff index is [`docs/handoffs/README.md`](docs/handoffs/README.md).

## Current implementation state

The main product/code-completable milestones are implemented:

- Rust + Tauri desktop application and React/Vite web companion;
- bounded dice expression parser with modifiers and `kh`/`kl`/`dh`/`dl` selections;
- secure native/browser randomness and deterministic cross-runtime seeded mode;
- localized roll workspace, presets, history, statistics, probability, Settings, onboarding, command palette, and About UI;
- reviewed English/Hindi catalogs, persisted locale preference, document `lang`, localized built-ins, and explicit `en-US`/`hi-IN` presentation formatting;
- validated/bounded local persistence and backup schema-v1 restore;
- spreadsheet-safe CSV and JSON history export;
- Tauri-native OS save dialogs through the dedicated bounded `save_text_export` Rust command with browser Blob-download fallback;
- privacy-safe local structured logging;
- generated/adversarial parser tests and coverage-guided Rust parser fuzz target;
- production-bundle real-browser CDP smoke automation;
- executable performance benchmarks;
- cross-platform draft release packaging with provenance metadata and SHA-256 checksums;
- capability/CSP/offline-network/runtime/native-command/localized-formatting/lock consistency policy audits;
- structured GitHub issue/PR/support/ownership/funding metadata.

## Documentation completion state

The repository now has a deep documentation system rather than only individual guides.

Start at [`docs/README.md`](docs/README.md).

Major references include:

- [`docs/architecture.md`](docs/architecture.md) — current system architecture;
- [`docs/application-flows.md`](docs/application-flows.md) — startup/roll/history/probability/localization/export/backup/storage/error/release flows;
- [`docs/data-contracts.md`](docs/data-contracts.md) — domain, persistence, backup, native, locale, version, and lockfile contracts;
- [`docs/code-reference.md`](docs/code-reference.md) — maintainer-level module responsibilities and change routing;
- [`docs/automation-reference.md`](docs/automation-reference.md) — every npm command, repository script, workflow, and evidence meaning;
- [`docs/repository-file-reference.md`](docs/repository-file-reference.md) — every Git-tracked file by exact path with purpose/relationships;
- [`docs/repository-policy-gates.md`](docs/repository-policy-gates.md) — executable security/architecture policy index;
- [`docs/release.md`](docs/release.md) and [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md) — release process/evidence;
- [`docs/release-blockers-current.md`](docs/release-blockers-current.md) — current evidence-gated blockers.

### Exhaustive file coverage

The file reference is enforced mechanically by:

- `scripts/check-file-reference.mjs`;
- `scripts/check-file-reference.test.mjs`;
- `scripts/check-file-reference.integration.test.mjs`.

Commands:

```bash
npm run docs:inventory:test
npm run docs:inventory
```

The audit compares `git ls-files -z` with exact first-column paths in `docs/repository-file-reference.md`. A new tracked file must be documented in the same change or the repository audit will fail once executed.

`.github/workflows/repository-audit.yml` now includes both the inventory self-test and exhaustive tracked-file audit.

## Correctness fixes discovered by the documentation audit

Writing the application flows/data/security contracts exposed implementation/policy mismatches that were fixed rather than documented as if they were correct.

### Backup export/restore size parity

Previously the importer rejected backups above 5,000,000 UTF-8 bytes but browser export could still create a larger backup.

Now:

- `backupToJson()` enforces the same 5,000,000-byte `TextEncoder` limit as `parseBackupJson()`;
- oversized output fails before browser/native save rather than being silently truncated;
- the stable `backup-too-large` error/context is reused;
- Settings renders the existing localized 5 MB backup error for known oversized exports;
- the generic native text transport remains separately capped at 6,000,000 bytes;
- tests cover oversized serialization and Hindi export failure feedback without raw private/developer error details.

Relevant commits include:

- `3595652f` — `fix: keep exported backups within restore size limit`
- `c57a2dc0` — `fix: show localized backup export size errors`
- `b4d3fa1c` — `test: reject backups too large to restore before export`
- `825ab06e` — `test: localize oversized backup export feedback`

### Live shell and command-palette localization

Persistent shell navigation and command definitions previously captured translated strings at module evaluation, so a live English/Hindi switch could leave those surfaces in the previous language until reload.

Now:

- `AppShell` builds navigation labels during render;
- `CommandPalette` builds command labels/details during render through `getCommands()`;
- the shell brand accessible name no longer appends a hardcoded English word;
- the live application integration test verifies Hindi shell navigation, command-palette heading/commands, built-in presets, and document language while preserving user-created preset text;
- localization documentation explicitly forbids module-level capture of translated primitive values that need live switching.

Relevant commits include:

- `c506ff79` — `fix: refresh navigation labels after locale changes`
- `0dd6fcef` — `fix: refresh command labels after locale changes`
- `e38f4864` — `test: cover live shell and command palette localization`
- `f4850483` — `fix: remove hardcoded English from brand accessible name`
- `269c7261` — `test: target localized command dialog semantically`
- `12a2b904` — `docs: prevent stale module captured locale strings`

### Production CSP versus local development loopback

The Tauri security/offline-network audits originally treated `devCsp` exactly like packaged production CSP and therefore could falsely reject the legitimate Vite/Tauri development sources `http://localhost:1420` and `ws://localhost:1421`.

Now:

- packaged production CSP remains strict;
- explicit loopback URLs are allowed only while auditing `devCsp`;
- supported loopback forms are `localhost`, `127.0.0.1`, and `[::1]`;
- scheme-wide `http:` / `https:` / `ws:` / `wss:` sources remain forbidden;
- non-loopback remote development origins remain forbidden;
- localhost remains forbidden as a packaged production dependency;
- tests cover development loopback acceptance plus production/non-loopback/broad-scheme rejection;
- `docs/tauri-security-policy.md` and `docs/offline-network-policy.md` document the distinction.

Relevant commits include:

- `d6739ff4` — `fix: allow loopback development origins in Tauri CSP audit`
- `20b81e25` — `test: distinguish dev loopback from remote Tauri origins`
- `98c64a74` — `fix: allow loopback development sources in offline CSP audit`
- `f8b72bb2` — `test: distinguish dev loopback from production network sources`
- `430d920f` — `docs: document loopback only development CSP exception`
- `e55ad9cc` — `docs: document development loopback network exception`

The canonical application/data docs were also updated after these fixes so documentation describes the actual corrected behavior rather than the earlier mismatch.

## Current repository policy commands

`package.json` exposes stable dependency-free audit commands:

```text
security:secrets:test
security:secrets
docs:check:test
docs:check
docs:inventory:test
docs:inventory
policy:capabilities
policy:tauri-security
policy:offline-csp
policy:localized-formatting
policy:runtime
policy:native-commands
policy:lockfiles
policy:boundaries
policy:test
policy:all
test:e2e:infra
version:check:test
version:check
release:verify
release:verify:test
```

Normal frontend and Rust checks remain separate from these repository-level audits.

## Execution-environment limitation

A clean-checkout verification was attempted from the available execution container after the documentation/policy changes. The container still cannot resolve `github.com`, so it cannot clone the repository or regenerate Cargo dependencies locally.

Therefore no local Node/Rust pass is being claimed from that container. Repository tooling/configuration/tests are committed, but execution evidence remains separate until an environment with repository/network access actually runs them.

## Current first release blocker — still open

`src-tauri/Cargo.toml` declares:

```toml
tauri-plugin-dialog = "2.7.2"
```

The latest observed `src-tauri/Cargo.lock` still shows the Tauri package sequence without a `tauri-plugin-dialog` package entry. Therefore the dialog dependency graph has **not** been observed as regenerated in the committed lockfile.

Do not hand-edit Cargo's transitive lock entries.

Required resolution on a network-enabled runner:

```bash
cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

Then run/observe the repository policy/documentation/frontend/browser/fuzz checks against the resulting exact commit.

## Other evidence-gated release work

Still open until observed on the intended release candidate:

- full production real-browser E2E success on unrestricted infrastructure;
- a bounded parser fuzz campaign with no unresolved finding;
- release-candidate benchmark evidence with machine/runtime metadata;
- clean Windows/macOS/Linux candidate builds;
- native CSV/JSON/backup save-dialog save/cancel/failure smoke on each desktop platform;
- English/Hindi candidate visual and accessibility review;
- keyboard/screen-reader/200%-text/reduced-motion manual review;
- CodeQL/dependency/repository-security results review;
- real screenshots from verified candidate builds;
- signing/notarization where credentials/infrastructure are available, or accurate unsigned documentation otherwise;
- downloaded artifact checksum/provenance/content review;
- human review and publication of the draft `v0.1.0` release.

Use [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md) rather than marking these complete from workflow configuration alone.

## Continuation rule

Do not repeat completed implementation/documentation work. Continue from the first unresolved evidence or newly discovered defect:

1. regenerate/commit the current Cargo lockfile;
2. observe locked Rust quality checks;
3. observe repository documentation/policy/frontend/browser/fuzz checks on the same commit;
4. produce and smoke-test platform release candidates;
5. record candidate benchmarks/accessibility/screenshots/security/provenance evidence;
6. publish only after the draft candidate is reviewed and no release blocker remains.
