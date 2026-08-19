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
- [ ] Import/restore UI for validated DiceLab backup files.
- [ ] Optional native save dialog integration with narrowly scoped permissions.
- [ ] Externalized translation catalog and first additional locale.
- [ ] Virtualized history for very large retained histories.

## Phase 4 — Verification depth

- [x] TypeScript parser tests.
- [x] Dice-engine tests.
- [x] Exact probability tests.
- [x] Export serialization tests.
- [x] Rust native tests.
- [ ] Add component accessibility smoke tests.
- [ ] Add property-based parser invariants.
- [ ] Add fuzz target for Rust expression parsing.
- [ ] Add browser end-to-end tests for primary journeys.
- [ ] Establish and record performance benchmarks.

## Phase 5 — Release engineering

- [ ] Generate and commit npm/Cargo lockfiles from a network-enabled runner.
- [ ] Verify clean builds on Windows, macOS, and Linux.
- [ ] Capture real screenshots from release-candidate builds.
- [ ] Add signed release artifacts where signing credentials are available.
- [ ] Publish `v0.1.0` release notes and checksums.

## Phase 6 — Final audit

- [ ] Clean-checkout setup verification.
- [ ] Full lint/format/type/test/build suite green.
- [ ] Dependency and CodeQL checks reviewed.
- [ ] Documentation link audit.
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
