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
- Browser integration coverage for roll → history → export, backup restore, and Settings → About journeys.
- Component keyboard/accessibility regression tests for command palette, onboarding, and settings behavior.
- Corrupted local-storage recovery tests and persisted-data validation.
- Rust/TypeScript cross-runtime deterministic RNG reference-vector tests.
- GitHub CI with locked npm/Cargo dependency verification.
- Tag-driven cross-platform draft release packaging with ZIP archives and `SHA256SUMS.txt`.
- Tauri CSP and least-privilege capability configuration.
- Professional project documentation baseline.

### Changed

- TypeScript and Rust seeded modes now use the same UTF-8 FNV-1a 32-bit seed hash and xorshift32 sequence so identical effective seeds reproduce identical deterministic values across web and desktop.
- Probability calculations advertised as exact now reject raw-outcome counts that exceed JavaScript safe-integer precision.
- Backup import validation rejects internally inconsistent roll totals, duplicate IDs, duplicate/out-of-range die indices, impossible die values, malformed timestamps, missing deterministic seeds, mismatched modifiers, and invalid keep/drop state.
- Imported and locally persisted settings normalize contradictory reduced-motion/animation state.
- Local history and custom presets are validated, bounded, and deduplicated before use or persistence.
- Release tags now produce a draft GitHub release only after the web and all desktop build jobs succeed; publication remains a deliberate maintainer action.

### Fixed

- Backups produced from a maximum-length 120-character user seed can be restored after DiceLab appends the deterministic sequence suffix.
- Corrupted or forged local-storage entries no longer flow directly into application state.
- Command-palette focus is trapped while open and restored to the invoking control after dismissal.

### Security

- Secure mode uses OS-backed native randomness on desktop and Web Crypto in the browser companion.
- Untrusted dice expressions are bounded and validated.
- CSV exports neutralize formula-like cell prefixes before spreadsheet applications can interpret them as formulas.
- Imported backups are schema-bounded and validated before replacing local state.
- Duplicate restored identifiers are rejected to avoid ambiguous application state.
- Desktop content is constrained by a restrictive CSP.
- No broad filesystem, shell, or network plugin permissions are granted.

## [0.1.0] - planned

The first release candidate will be tagged only after clean-checkout verification, platform builds, real screenshots, dependency/security review, and release-candidate smoke checks satisfy the Definition of Done.
