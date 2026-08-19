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
- Versioned backup export and validated backup restore for history, custom presets, and settings.
- Light, dark, and system themes.
- Reduced-motion and animation controls.
- First-run onboarding, responsive navigation, and keyboard command palette.
- About/privacy/support surfaces and **Made by the Sanskar** credit.
- Externalized English product/error catalog and locale-neutral native error contract.
- Structured privacy-safe application event logging with sensitive-key redaction.
- Rust, TypeScript, probability, parser, export, backup-integrity, storage-recovery, logger, and native-contract tests.
- GitHub CI, dependency-lock automation, CodeQL, Dependabot, and cross-platform tagged release-build workflows.
- Tauri CSP and least-privilege capability configuration.
- Professional project documentation and GitHub repository-governance guidance.

### Fixed

- Prevented an extreme negative native modifier from reaching an overflowing absolute-value check.
- Made dependency-lock automation rebase before push so a concurrent `main` update does not cause an avoidable non-fast-forward failure.
- Made CI support the initial pre-lockfile bootstrap state while enforcing locked dependency resolution once lockfiles exist.
- Filtered corrupted or inconsistent local roll/preset state instead of rendering it as trusted history.

### Security

- Secure mode uses OS-backed native randomness on desktop and Web Crypto with rejection sampling in the browser companion.
- Untrusted dice expressions are bounded and validated on TypeScript and Rust boundaries.
- Backup imports are size-, schema-, type-, range-, selection-, and total-consistency validated before restore.
- User-controlled seed text is neutralized when exported to CSV to reduce spreadsheet-formula interpretation risk.
- Structured logs redact sensitive-key values and avoid logging error messages that may contain user-controlled content.
- Desktop content is constrained by a restrictive CSP.
- No broad filesystem, shell, or network plugin permissions are granted.

## [0.1.0] - planned

The first release candidate will be tagged only after clean-checkout verification, final CI/security review, platform builds, screenshots, and release-candidate checks pass the Definition of Done.
