# DiceLab Roadmap

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
- [x] Backup export.
- [x] Validated backup import/restore.
- [x] Exact common-expression probability calculator.
- [x] Settings for theme, data, accessibility, and randomness.
- [x] Keyboard command palette.
- [x] About/support/privacy UI.
- [x] First-run onboarding.

## Phase 3 — Hardening and advanced UX

- [x] Restrictive desktop CSP.
- [x] Minimal Tauri capabilities.
- [x] Reduced-motion and non-animation controls.
- [x] Responsive desktop/tablet/mobile-web layouts.
- [x] Structured privacy-safe application logging.
- [x] Corrupted local-state validation and recovery.
- [x] Spreadsheet-safe CSV handling for user-controlled text.
- [x] Externalized English product/error catalog with locale-neutral native error codes.
- [ ] Add the first translated locale after translation review is available.
- [ ] Optional native save dialog integration with narrowly scoped permissions if it materially improves desktop UX.
- [ ] Virtualize history only if measured needs justify raising the current 5,000-roll cap.

## Phase 4 — Verification depth

- [x] TypeScript parser tests.
- [x] Dice-engine tests.
- [x] Exact probability tests.
- [x] Export serialization and CSV-hardening tests.
- [x] Backup integrity tests.
- [x] Corrupted local-storage recovery tests.
- [x] Structured-log redaction tests.
- [x] Native error-contract tests.
- [x] Rust native tests.
- [ ] Add component accessibility smoke tests.
- [ ] Add broader property-style parser invariants.
- [ ] Add a fuzz target for Rust expression parsing if the maintenance cost remains justified.
- [ ] Add browser end-to-end tests for primary journeys.
- [ ] Establish and record repeatable performance benchmarks.

## Phase 5 — Release engineering

- [x] Generate and commit npm/Cargo lockfiles from a network-enabled runner.
- [x] Add cross-platform tagged release-build workflow.
- [ ] Verify clean release builds on Windows, macOS, and Linux for the exact release candidate.
- [ ] Capture real screenshots from release-candidate builds.
- [ ] Add signed/notarized release artifacts where signing credentials are available.
- [ ] Publish `v0.1.0` release notes and checksums after the release gate passes.

## Phase 6 — Final audit

- [ ] Clean-checkout setup verification on the final candidate.
- [ ] Full lint/format/type/test/build suite green on the final candidate.
- [ ] Dependency and CodeQL checks reviewed on the final candidate.
- [ ] Documentation-link audit.
- [ ] Manual keyboard and screen-reader smoke review.
- [ ] Release-candidate artifact verification.

## Post-1.0 candidates

These are intentionally not commitments. They should be implemented only when they improve the product without compromising the offline-first model:

- additional probability visualizations;
- shareable local preset files;
- more built-in tabletop preset packs;
- deeper distribution comparison tools;
- optional update notifications;
- additional localizations.

The core product remains fully usable without an account or donation.
