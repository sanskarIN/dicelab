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
- Native desktop save dialogs for CSV/JSON exports through a dedicated bounded Rust command, while browser builds retain their ordinary download path.
- Light, dark, and system themes.
- Reduced-motion and animation controls.
- First-run onboarding, responsive navigation, and keyboard command palette.
- Settings surface for release/version information and direct About navigation.
- About/privacy/support surfaces and **Made by the Sanskar** credit.
- Localized application-level recovery UI for unexpected React render failures without clearing local data.
- Typed English message catalog and locale boundary for migrated user-facing React/preset copy.
- Reviewed Hindi message catalog with persisted English/Hindi language selection, localized built-in presets, document-language metadata, and backup compatibility.
- Locale-aware number, date, and time formatting helpers for roll, history, and probability presentation.
- Stable parser, probability, and backup validation error codes with localized presentation mappings.
- Localization contributor guide and locale/error-contract tests.
- Structured local application logger with recursive sensitive-key redaction, bounded context, and raw-error omission.
- Safe operational events for storage degradation and root UI recovery.
- Browser integration coverage for roll → history → export, backup restore, Settings → About, and live Hindi switching journeys.
- Additional localization lifecycle coverage for persisted-locale startup, first-run Hindi onboarding, backup-driven locale restoration, clear-data locale reset, user-preset preservation, Hindi parser validation, and Hindi backup/export failure feedback.
- Dependency-free real-browser production-bundle E2E smoke covering onboarding, rolling, history, real CSV download, reload persistence, keyboard command palette, probability, real backup download, clear-data flow, real file-input restore, and restored history.
- Extracted dependency-free CDP transport with Node tests for command routing, protocol errors, event waits/timeouts, and socket closure.
- Component keyboard/accessibility regression tests for command palette, onboarding, settings, large-history behavior, and root error recovery.
- Native/browser export-routing tests covering system-dialog cancellation, safe fallback behavior, payload/filename validation, final extension validation, and user-safe export status feedback.
- Generated TypeScript parser normalization/case/whitespace invariants.
- Generated native Rust parser normalization corpus plus adversarial malformed-input corpus.
- Coverage-guided native parser fuzz target with documented local workflow and a bounded scheduled/manual GitHub Actions campaign.
- Corrupted local-storage recovery tests and persisted-data validation.
- Rust/TypeScript cross-runtime deterministic RNG reference-vector tests.
- Progressive history rendering in 200-entry windows while full filtered statistics/exports remain available.
- Reusable domain history filtering with expression/total regression coverage.
- Executable Vitest benchmark suites for parser, RNG, probability, 5,000-record history filtering, and 5,000-record statistics.
- Dependency-free Markdown link audit wired into normal CI and tagged release checks.
- Exhaustive tracked-file documentation reference plus a `git ls-files` inventory audit, unit tests, committed-repository integration regression, and repository-audit workflow gate.
- Complete documentation hub plus deep application-flow, data-contract, maintainer-code, automation, policy, release-evidence, and every-file references.
- Dependency-free high-confidence secret audit plus built-in Node self-tests, wired into CI and tagged release verification before dependency installation.
- Application version consistency audit across npm/frontend/Cargo/Tauri metadata plus release-tag/version agreement checks.
- Dependency-free repository policy audits for desktop capabilities, Tauri CSP/remote IPC, offline network sources, localized formatting, native runtime access, native command contracts, and direct manifest/lock consistency.
- Dedicated and aggregate GitHub Actions policy workflows, including release-tag policy/lock consistency checks.
- Accepted native export ADR documenting the least-privilege OS-dialog save boundary and rejected broader filesystem alternatives.
- Release provenance manifest containing repository/tag/source commit/workflow identifiers, included in SHA-256 checksum verification.
- Release-candidate evidence template covering dependency integrity, CI/policy/fuzz/benchmarks, platform smoke, accessibility/localization, screenshots, signing, checksums, provenance, and final approval.
- Current release-blocker ledger separating implemented work from still-unobserved candidate evidence.
- Repository-governance guide covering branch protection rollout, labels, milestones, Discussions, security settings, and release review.
- Structured GitHub bug/feature/accessibility issue forms, public-issue routing, expanded CODEOWNERS, PR review checklist, support guidance, and optional funding metadata.
- GitHub CI with locked npm/Cargo dependency verification.
- Tag-driven cross-platform draft release packaging with ZIP archives, `RELEASE-METADATA.json`, and `SHA256SUMS.txt`.
- Tauri CSP and least-privilege capability configuration.
- Native export trust-boundary documentation covering browser/desktop behavior, validation, cancellation, and future-format review rules.
- Professional project documentation baseline.

### Changed

- TypeScript and Rust seeded modes now use the same UTF-8 FNV-1a 32-bit seed hash and xorshift32 sequence so identical effective seeds reproduce identical deterministic values across web and desktop.
- Probability calculations advertised as exact now reject raw-outcome counts that exceed JavaScript safe-integer precision.
- Roll, history, and probability presentation now use the selected DiceLab locale for explicit `Intl` number/date/time formatting instead of inheriting the host browser locale independently from UI language.
- Backup import validation rejects internally inconsistent roll totals, duplicate IDs, duplicate/out-of-range die indices, impossible die values, malformed timestamps, missing deterministic seeds, mismatched modifiers, and invalid keep/drop state.
- Parser/probability/backup UI feedback now resolves from stable error codes and catalog entries rather than raw exception messages.
- Imported and locally persisted settings normalize contradictory reduced-motion/animation state.
- Locale preferences are normalized to the reviewed English/Hindi set; missing or unsupported schema-v1 backup locale values fall back to English.
- Built-in preset copy follows the active catalog while user-created names, expressions, seeds, and history content remain unchanged.
- Local history and custom presets are validated, bounded, and deduplicated before use or persistence.
- History query logic is centralized in the domain layer so UI filtering, tests, and performance benchmarks share one implementation.
- History and backup exports now use the dedicated native save command inside Tauri and preserve the existing Blob-download implementation in normal browsers.
- Normal CI and tagged web release verification now self-test the browser automation infrastructure and require the real-browser smoke after the production build.
- The dependency-lockfile workflow supports manual dispatch and preserves exact generated lockfiles on a dedicated automation branch if a protected `main` branch rejects its direct update.
- Repository-level audit commands are exposed through stable npm scripts for documentation, policy, version, secret, E2E-infrastructure, and release-package verification.
- Repository audit now validates both Markdown links/anchors and exhaustive tracked-file documentation coverage.
- Contributor, pull-request, CODEOWNERS, README, ADR index, and handoff documentation now reflect the current English/Hindi product, native command/security boundaries, policy gates, generated-lock rules, and evidence-based release process.
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
- Hindi UI no longer mixes localized interface copy with host-locale number/date/time formatting on roll, history, and probability surfaces.
- Contributor documentation no longer incorrectly states that English is the only shipped locale.
- ADR index now includes all currently tracked architecture decisions rather than stopping after ADR-0003.
- Repository-audit command references for documentation/release self-tests now have matching package scripts.

### Security

- Secure mode uses OS-backed native randomness on desktop and Web Crypto in the browser companion.
- Untrusted dice expressions are bounded and validated.
- CSV exports neutralize formula-like cell prefixes before spreadsheet applications can interpret them as formulas.
- Imported backups are schema-bounded and validated before replacing local state.
- Duplicate restored identifiers are rejected to avoid ambiguous application state.
- Desktop CSV/JSON exports use a purpose-built Rust command that accepts no frontend-supplied destination path, allows only bounded CSV/JSON payloads, validates suggested filenames and final selected extensions, and writes only to the operating-system-dialog-selected path.
- Native export failures shown by the UI use localized safe messages and do not expose the selected private filesystem path.
- Structured logger redaction prevents normal operational events from serializing configured seeds, user content, backups, email/name fields, raw exception messages, or stacks.
- Storage/recovery diagnostics emit only stable event names and bounded safe metadata.
- CI/tagged builds run a self-tested high-confidence secret scanner that never prints matched credential values.
- The application recovery boundary logs only a fixed structured event from DiceLab rather than serializing raw exception contents.
- Desktop capability audits reject broad filesystem/shell/HTTP/process permission families, remote-origin capability scope, and wildcard/invalid window targets.
- Tauri configuration audits reject missing/self-unanchored CSP, wildcard sources, `unsafe-eval`, remote script sources, dangerous remote-domain IPC, and remote CSP network origins that conflict with the offline-first model.
- Native runtime and native-command audits keep Tauri API access, runtime probing, command names, command routing, and Rust handler entries within reviewed allowlists.
- Release lockfile consistency audit fails candidates whose direct manifest dependencies are not represented in committed lockfiles instead of silently resolving a different graph during release verification.
- Release provenance/checksum metadata ties packaged files to a tag/source commit/workflow run for draft review.
- Desktop content is constrained by a restrictive CSP.
- No broad filesystem, shell, or network plugin permissions are granted to the webview.

## [0.1.0] - planned

The first release candidate will be tagged only after clean-checkout verification, current generated dependency locks, platform builds, real screenshots, dependency/security review, real-browser/desktop smoke checks, and release-candidate verification satisfy the Definition of Done.
