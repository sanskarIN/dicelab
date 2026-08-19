# Changelog

All notable DiceLab changes are documented here. The project follows semantic-versioning principles while it evolves toward a stable 1.0 release.

## [Unreleased]

### Added

- Rust + Tauri 2 desktop foundation with a TypeScript + React web companion.
- Native secure random rolling and deterministic seeded rolling.
- Dice notation parser supporting custom sides, modifiers, `kh`, `kl`, `dh`, and `dl`.
- Quick d4, d6, d8, d10, d12, d20, and d100 controls.
- Saved tabletop presets and custom presets.
- Offline-first local history and settings persistence.
- History search, statistics, histogram, CSV export, and JSON export.
- Exact probability calculator for ordinary sums and manageable keep/drop expressions.
- Backup export and validated restore for history, custom presets, and settings.
- Light, dark, and system themes.
- Reduced-motion and animation controls.
- First-run onboarding, responsive navigation, and keyboard command palette.
- Settings surface for release/version information and direct About navigation.
- About/privacy/support surfaces and **Made by the Sanskar** credit.
- Localized application-level recovery UI for unexpected React render failures without clearing local data.
- Typed English message catalog and locale boundary for migrated user-facing React/preset copy.
- Stable parser, probability, and backup validation error codes with localized presentation mappings.
- Localization contributor guide and locale/error-contract tests.
- Structured local application logger with recursive sensitive-key redaction, bounded context, and raw-error omission.
- Safe operational events for storage degradation and root UI recovery.
- Browser integration coverage for roll → history → export, backup restore, and Settings → About journeys.
- Dependency-free real-browser production-bundle E2E smoke covering onboarding, rolling, history, real CSV download, reload persistence, keyboard command palette, probability, real backup download, clear-data flow, real file-input restore, and restored history.
- Extracted dependency-free CDP transport with Node tests for command routing, protocol errors, event waits/timeouts, and socket closure.
- Component keyboard/accessibility regression tests for command palette, onboarding, settings, large-history behavior, and root error recovery.
- Generated TypeScript parser normalization/case/whitespace invariants.
- Generated native Rust parser normalization corpus plus adversarial malformed-input corpus.
- Corrupted local-storage recovery tests and persisted-data validation.
- Rust/TypeScript cross-runtime deterministic RNG reference-vector tests.
- Progressive history rendering in 200-entry windows while full filtered statistics/exports remain available.
- Reusable domain history filtering with expression/total regression coverage.
- Executable Vitest benchmark suites for parser, RNG, probability, 5,000-record history filtering, and 5,000-record statistics.
- Dependency-free Markdown link audit wired into normal CI and tagged release checks.
- Dependency-free high-confidence secret audit plus built-in Node self-tests, wired into CI and tagged release verification before dependency installation.
- Application version consistency audit across npm/frontend/Cargo/Tauri metadata plus release-tag/version agreement checks.
- Release provenance manifest containing repository/tag/source commit/workflow identifiers, included in SHA-256 checksum verification.
- Repository-governance guide covering branch protection rollout, labels, milestones, Discussions, security settings, and release review.
- GitHub CI with locked npm/Cargo dependency verification.
- Tag-driven cross-platform draft release packaging with ZIP archives, `RELEASE-METADATA.json`, and `SHA256SUMS.txt`.
- Tauri CSP and least-privilege capability configuration.
- Professional project documentation baseline.

### Changed

- TypeScript and Rust seeded modes now use the same UTF-8 FNV-1a 32-bit seed hash and xorshift32 sequence so identical effective seeds reproduce identical deterministic values across web and desktop.
- Probability calculations advertised as exact now reject raw-outcome counts that exceed JavaScript safe-integer precision.
- Backup import validation rejects internally inconsistent roll totals, duplicate IDs, duplicate/out-of-range die indices, impossible die values, malformed timestamps, missing deterministic seeds, mismatched modifiers, and invalid keep/drop state.
- Parser/probability/backup UI feedback now resolves from stable error codes and catalog entries rather than raw exception messages.
- Imported and locally persisted settings normalize contradictory reduced-motion/animation state.
- Local history and custom presets are validated, bounded, and deduplicated before use or persistence.
- History query logic is centralized in the domain layer so UI filtering, tests, and performance benchmarks share one implementation.
- Normal CI and tagged web release verification now self-test the browser automation infrastructure and require the real-browser smoke after the production build.
- Release tags must match the synchronized declared application version before release dependencies/builds proceed.
- Release tags now produce a draft GitHub release only after the web and all desktop build jobs succeed; publication remains a deliberate maintainer action.
- Core product metadata is centralized for Settings/About consistency.

### Fixed

- Backups produced from a maximum-length 120-character user seed can be restored after DiceLab appends the deterministic sequence suffix.
- Corrupted or forged local-storage entries no longer flow directly into application state.
- Command-palette focus is trapped while open and restored to the invoking control after dismissal.
- Unexpected React render failures now show a recovery surface instead of leaving the product with an unhandled blank interface.
- Backup-error localization now always returns the caller-provided safe fallback if a future/unrecognized code reaches the mapper.
- History filter tests no longer use a query that ambiguously matches both a total and an expression suffix.
- Browser E2E navigation/reload synchronization now waits for DevTools page-load events and surfaces `Page.navigate` network/policy errors explicitly instead of racing the previous document.

### Security

- Secure mode uses OS-backed native randomness on desktop and Web Crypto in the browser companion.
- Untrusted dice expressions are bounded and validated.
- CSV exports neutralize formula-like cell prefixes before spreadsheet applications can interpret them as formulas.
- Imported backups are schema-bounded and validated before replacing local state.
- Duplicate restored identifiers are rejected to avoid ambiguous application state.
- Structured logger redaction prevents normal operational events from serializing configured seeds, user content, backups, email/name fields, raw exception messages, or stacks.
- Storage/recovery diagnostics emit only stable event names and bounded safe metadata.
- CI/tagged builds run a self-tested high-confidence secret scanner that never prints matched credential values.
- The application recovery boundary logs only a fixed structured event from DiceLab rather than serializing raw exception contents.
- Release provenance/checksum metadata ties packaged files to a tag/source commit/workflow run for draft review.
- Desktop content is constrained by a restrictive CSP.
- No broad filesystem, shell, or network plugin permissions are granted.

## [0.1.0] - planned

The first release candidate will be tagged only after clean-checkout verification, platform builds, real screenshots, dependency/security review, real-browser/desktop smoke checks, and release-candidate verification satisfy the Definition of Done.
