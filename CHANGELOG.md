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
- Backup export for history, custom presets, and settings.
- Light, dark, and system themes.
- Reduced-motion and animation controls.
- First-run onboarding, responsive navigation, and keyboard command palette.
- About/privacy/support surfaces and **Made by the Sanskar** credit.
- Rust, TypeScript, probability, parser, and export tests.
- GitHub CI and dependency-lock automation foundations.
- Tauri CSP and least-privilege capability configuration.
- Professional project documentation baseline.

### Security

- Secure mode uses OS-backed native randomness on desktop and Web Crypto in the browser companion.
- Untrusted dice expressions are bounded and validated.
- Desktop content is constrained by a restrictive CSP.
- No broad filesystem, shell, or network plugin permissions are granted.

## [0.1.0] - planned

The first release candidate will be tagged only after the clean-checkout verification, platform builds, dependency lockfiles, screenshots, and release workflow pass the Definition of Done.
