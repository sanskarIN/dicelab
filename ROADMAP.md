# DiceLab Roadmap

Current release-preparation target: **2.18.12** (`v2.18.12`).

This roadmap tracks engineering milestones rather than promises of fixed dates. Priorities may change when testing reveals correctness, accessibility, security, or platform issues.

## Phase 0 — Foundation

- [x] Public MIT repository baseline.
- [x] Rust + Tauri + TypeScript architecture.
- [x] Strict TypeScript/lint/format configuration.
- [x] Core security and privacy documents.
- [x] Initial CI configuration.
- [x] App icon and product identity.

## Phase 1 — End-to-end MVP

- [x] Standard and custom-sided dice.
- [x] Multi-die expressions and modifiers.
- [x] Keep/drop expression parser.
- [x] Native secure random mode.
- [x] Deterministic seeded mode.
- [x] Responsive roll workspace.
- [x] Offline local history.
- [x] Robust validation and user-safe errors.

## Phase 2 — Complete core product

- [x] Saved tabletop presets.
- [x] History search and summary statistics.
- [x] Observed histogram.
- [x] CSV/JSON log export.
- [x] Backup export and validated restore UI.
- [x] Exact common-expression probability calculator with explicit precision/complexity limits.
- [x] Settings for theme, data, accessibility, randomness, updates, and About.
- [x] Keyboard command palette.
- [x] About/support/privacy UI.
- [x] First-run onboarding.

## Phase 3 — Hardening and advanced UX

- [x] Restrictive native CSP.
- [x] Minimal Tauri capabilities.
- [x] Reduced-motion and non-animation controls.
- [x] Responsive desktop/tablet/mobile-web layouts.
- [x] Mobile safe-area, dynamic-viewport, coarse-pointer touch-target, and compact landscape rules.
- [x] Local-storage corruption recovery and persisted-record validation.
- [x] Backup duplicate/integrity validation and spreadsheet-safe CSV output.
- [x] Cross-runtime deterministic seeded parity.
- [x] Externalized typed English catalog and locale boundary for user-facing React/preset copy.
- [x] Stable parser/probability/backup error codes with localized UI mapping.
- [x] Structured local logging with secret/PII-oriented redaction and bounded context.
- [x] Progressive rendering for very large retained histories.
- [x] Native save dialog integration through a dedicated bounded Rust command with browser fallback.
- [x] Android `content://` and iOS security-scoped native export support through Tauri's filesystem abstraction.
- [x] Add a reviewed second locale before exposing language selection.
- [x] Expose a persisted English/Hindi language preference with backup compatibility and document-language metadata.
- [x] Apply active-locale number/date/time formatting to roll, history, and probability presentation.
- [x] Enforce exact persisted keep/drop selection semantics.
- [x] Reject oversized backup files before reading their text into memory.
- [x] Keep CSV formula protection scoped to untrusted text while preserving numeric columns.
- [x] Normalize live history-limit input to the persisted integer contract.
- [x] Add exact probability quartiles, standard deviation, and configurable threshold probabilities.
- [x] Add exact pairwise comparison for independent dice-expression distributions.
- [x] Add versioned, bounded, validated local preset-file import/export with English/Hindi UI states.
- [x] Enforce high-value accessibility semantics with a dependency-free repository policy contract.
- [x] Expose command-palette dialog and keyboard-shortcut semantics on its trigger.

## Phase 4 — Cross-platform native targets

- [x] Windows Tauri desktop target.
- [x] macOS Tauri desktop target.
- [x] Linux Tauri desktop target.
- [x] Android Tauri mobile configuration with API 24 minimum.
- [x] iOS/iPadOS Tauri mobile configuration with iOS 14.0 minimum.
- [x] Explicit least-privilege capability coverage for Linux, macOS, Windows, Android, and iOS.
- [x] Android init/dev/APK+AAB command surface.
- [x] iOS init/dev/build/simulator/archive command surface.
- [x] Android ARM64 build job in normal CI.
- [x] iOS Apple-Silicon simulator build job in normal CI.
- [x] Tagged universal Android APK/AAB release-validation build.
- [x] Tagged unsigned iOS device archive release-validation build.
- [ ] Observe Android CI green on the exact 2.18.12 candidate commit.
- [ ] Observe iOS simulator CI green on the exact 2.18.12 candidate commit.
- [ ] Record Android physical-device smoke evidence, including native export through the system document provider.
- [ ] Record iPhone physical-device smoke evidence, including safe areas, orientation, persistence, and native export.
- [ ] Record iPad smoke evidence for tablet layout/orientation and native export.
- [ ] Configure Android production signing only when a private keystore is available through secure CI/local credentials.
- [ ] Configure iOS App Store signing only when Apple Developer/App Store Connect credentials are available through secure CI/local credentials.

## Phase 5 — Verification depth

- [x] TypeScript parser tests.
- [x] Dice-engine tests.
- [x] Exact probability tests and safe-integer precision guards.
- [x] Exact probability insight, threshold, and pairwise-comparison regression tests.
- [x] Export/backup serialization and hostile-input tests.
- [x] Versioned preset-file validation, normalization, size-limit, and transfer-control tests.
- [x] Rust native tests and TypeScript/Rust seeded reference vectors.
- [x] Roll-statistics and deterministic RNG edge coverage.
- [x] Component keyboard/accessibility smoke tests for modal and settings surfaces.
- [x] Browser-state integration tests for roll/history/export, backup restore, About navigation, and live locale switching.
- [x] Generated parser normalization/case/whitespace invariants.
- [x] Native Rust generated normalization corpus and adversarial malformed-input regression corpus.
- [x] Large-history progressive-rendering regression coverage.
- [x] Domain history-filter regression coverage.
- [x] Structured logger/storage-degradation security regression coverage.
- [x] Executable Vitest benchmarks for parser, RNG, probability, 5,000-record filtering, and 5,000-record statistics.
- [x] Dependency-free real-browser E2E runner for onboarding, roll/history, downloads, reload persistence, keyboard commands, probability, clear-data, and backup restore.
- [x] Dependency-free CDP transport tests and E2E syntax self-check.
- [x] Accessibility policy self-tests wired into normal CI and dependency-free repository audit.
- [ ] Observe the full real-browser E2E journey green on 2.18.12 CI/release-candidate infrastructure.
- [x] Add a coverage-guided Rust parser fuzz target with a bounded scheduled GitHub Actions campaign.
- [ ] Observe a parser fuzz campaign green on the 2.18.12 candidate.
- [ ] Record 2.18.12 release-candidate benchmark evidence on a documented machine/runtime.

## Phase 6 — Release engineering

- [x] Set executable/configuration source version metadata to 2.18.12.
- [x] Generate and commit npm/Cargo lock metadata synchronized to 2.18.12.
- [x] Expand lockfile generation to release-preparation branches and every application-version source.
- [x] Regenerate and commit `src-tauri/Cargo.lock` for the direct `tauri-plugin-fs` mobile export dependency in the previous candidate baseline.
- [x] Enforce locked dependencies in main CI and tagged release verification.
- [x] Configure tagged Windows/macOS/Linux/web artifact builds.
- [x] Configure tagged Android and unsigned iOS release-validation artifact builds.
- [x] Package verified artifacts into draft GitHub releases with SHA-256 checksums.
- [x] Add release provenance metadata (tag/source commit/workflow run) and checksum it with packaged artifacts.
- [x] Add dependency-free repository secret audit and self-tests to CI/tagged verification.
- [x] Add synchronized application-version audit and release-tag/version agreement gate.
- [x] Document branch protection, labels, milestones, Discussions, security settings, and release governance.
- [x] Run normal CI, repository audit, and policy audit on `release/**` preparation branches.
- [x] Repair the Rust-formatting regression previously exposed by candidate CI.
- [ ] Verify clean builds on Windows, macOS, Linux, Android, and iOS from the 2.18.12 release candidate.
- [ ] Capture real screenshots from verified 2.18.12 desktop and mobile candidate builds.
- [ ] Add signed/notarized/store-ready release artifacts where credentials are available and document unsigned builds accurately otherwise.
- [ ] Publish `v2.18.12` only after draft artifact smoke checks and the release-evidence gate pass.

## Phase 7 — 2.18.12 final audit

- [ ] Clean-checkout setup verification.
- [ ] Full pre-install/security/version/E2E-infrastructure checks observed green on the release commit.
- [ ] Full lint/format/type/test/build/browser-E2E suite observed green on the release commit.
- [ ] Rust format/test/Clippy observed green on the release commit.
- [ ] Android and iOS compile jobs observed green on the release commit.
- [ ] Physical Android/iPhone/iPad native-export and responsive-layout smoke evidence recorded.
- [ ] Dependency, CodeQL, repository security settings, and secret-scan results reviewed.
- [ ] Documentation-link and tracked-file inventory audits observed green on the release commit.
- [ ] Network-enabled external-link audit.
- [ ] Manual keyboard, touch, and screen-reader smoke review on representative targets.
- [ ] Release-candidate artifact/provenance/checksum verification.
- [ ] Confirm screenshots and release notes match the actual 2.18.12 candidate build.

## Future candidates

These are intentionally not commitments. They should be implemented only when they improve the product without compromising the offline-first model:

- additional comparative probability visualizations beyond the exact threshold and pairwise views;
- more built-in tabletop preset packs;
- optional native updater after signing/release infrastructure is mature;
- additional localizations after catalog review infrastructure is established;
- optional automated store delivery after signing, first manual registrations, and store governance are established.

The core product remains fully usable without an account or donation.
