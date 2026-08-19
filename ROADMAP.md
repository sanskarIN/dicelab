# DiceLab Roadmap

Current release-preparation target: **2.0.12** (`v2.0.12`).

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

- [x] Restrictive desktop CSP.
- [x] Minimal Tauri capabilities.
- [x] Reduced-motion and non-animation controls.
- [x] Responsive desktop/tablet/mobile-web layouts.
- [x] Local-storage corruption recovery and persisted-record validation.
- [x] Backup duplicate/integrity validation and spreadsheet-safe CSV output.
- [x] Cross-runtime deterministic seeded parity.
- [x] Externalized typed English catalog and locale boundary for user-facing React/preset copy.
- [x] Stable parser/probability/backup error codes with localized UI mapping.
- [x] Structured local logging with secret/PII-oriented redaction and bounded context.
- [x] Progressive rendering for very large retained histories.
- [x] Native desktop save dialog integration through a dedicated bounded Rust command with browser fallback.
- [x] Add a reviewed second locale before exposing language selection.
- [x] Expose a persisted English/Hindi language preference with backup compatibility and document-language metadata.
- [x] Apply active-locale number/date/time formatting to roll, history, and probability presentation.
- [x] Enforce exact persisted keep/drop selection semantics.
- [x] Reject oversized backup files before reading their text into memory.
- [x] Keep CSV formula protection scoped to untrusted text while preserving numeric columns.
- [x] Normalize live history-limit input to the persisted integer contract.

## Phase 4 — Verification depth

- [x] TypeScript parser tests.
- [x] Dice-engine tests.
- [x] Exact probability tests and safe-integer precision guards.
- [x] Export/backup serialization and hostile-input tests.
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
- [ ] Observe the full real-browser E2E journey green on 2.0.12 CI/release-candidate infrastructure.
- [x] Add a coverage-guided Rust parser fuzz target with a bounded scheduled GitHub Actions campaign.
- [ ] Observe a parser fuzz campaign green on the 2.0.12 candidate.
- [ ] Record 2.0.12 release-candidate benchmark evidence on a documented machine/runtime.

## Phase 5 — Release engineering

- [x] Synchronize executable/configuration version metadata to 2.0.12.
- [x] Commit npm and Cargo lockfiles for the previous dependency graph.
- [ ] Regenerate and commit both lockfiles for the 2.0.12 manifests, including `tauri-plugin-dialog`, then observe locked Rust checks.
- [x] Enforce locked dependencies in main CI and tagged release verification.
- [x] Configure tagged Windows/macOS/Linux/web artifact builds.
- [x] Package verified artifacts into draft GitHub releases with SHA-256 checksums.
- [x] Add release provenance metadata (tag/source commit/workflow run) and checksum it with packaged artifacts.
- [x] Add dependency-free repository secret audit and self-tests to CI/tagged verification.
- [x] Add synchronized application-version audit and release-tag/version agreement gate.
- [x] Document branch protection, labels, milestones, Discussions, security settings, and release governance.
- [ ] Verify clean builds on Windows, macOS, and Linux from the 2.0.12 release candidate.
- [ ] Capture real screenshots from verified 2.0.12 candidate builds.
- [ ] Add signed/notarized release artifacts where credentials are available and document unsigned builds accurately otherwise.
- [ ] Publish `v2.0.12` only after draft artifact smoke checks and the release-evidence gate pass.

## Phase 6 — 2.0.12 final audit

- [ ] Clean-checkout setup verification.
- [ ] Full pre-install/security/version/E2E-infrastructure checks observed green on the release commit.
- [ ] Full lint/format/type/test/build/browser-E2E suite observed green on the release commit.
- [ ] Rust format/test/Clippy observed green on the release commit.
- [ ] Dependency, CodeQL, repository security settings, and secret-scan results reviewed.
- [ ] Documentation-link and tracked-file inventory audits observed green on the release commit.
- [ ] Network-enabled external-link audit.
- [ ] Manual keyboard and screen-reader smoke review.
- [ ] Release-candidate artifact/provenance/checksum verification.
- [ ] Confirm screenshots and release notes match the actual 2.0.12 candidate build.

## Future candidates

These are intentionally not commitments. They should be implemented only when they improve the product without compromising the offline-first model:

- additional probability visualizations;
- shareable local preset files;
- more built-in tabletop preset packs;
- deeper distribution comparison tools;
- optional native updater after signing/release infrastructure is mature;
- additional localizations after catalog review infrastructure is established.

The core product remains fully usable without an account or donation.
