# Changelog

All notable DiceLab changes are documented here. The project follows semantic-versioning principles.

## [Unreleased]

The next publication target is **2.18.12**. The section below records the prepared 2.18.12 candidate content, but the version is not considered published until `v2.18.12` passes the release evidence gate and the draft release is explicitly approved.

## [2.18.12] - 2026-08-24 (release candidate)

### Added

- Dependency-free accessibility policy checks for the localized skip link, main landmark, active navigation, command-palette dialog/shortcut semantics, live validation/result announcements, modal focus containment/restoration, onboarding semantics, Settings status/import semantics, and visible keyboard focus rules.
- Focused `policy:accessibility` and `policy:accessibility:test` commands wired into normal CI and the dependency-free repository audit before dependency installation.
- Pull-request release preparation on `release/**` branches so web, Rust, Android, iOS, repository-audit, and policy surfaces can be exercised before a candidate is merged to `main`.

### Changed

- Application version metadata is synchronized to `2.18.12` across `package.json`, `package-lock.json`, `src/config/app.ts`, `src-tauri/Cargo.toml`, the DiceLab package entry in `src-tauri/Cargo.lock`, and `src-tauri/tauri.conf.json`.
- Lockfile generation now supports `release/**` preparation branches, watches every application-version source, and writes generated npm/Cargo locks back to the active branch or a branch-specific automation fallback.
- The command-palette trigger now exposes `aria-haspopup="dialog"` and `aria-keyshortcuts="Control+K Meta+K"` while preserving the existing keyboard handler and visual shortcut hint.
- `ROADMAP.md`, accessibility guidance, and the current release-blocker ledger now identify `2.18.12` as the active candidate and keep publication/device/signing claims evidence-gated.
- The useful accessibility hardening from the older diverged accessibility branch is carried forward without adopting its unsynchronized Vitest/Vite dependency jump.

### Fixed

- Rust source formatting exposed by the earlier candidate CI is normalized so `cargo fmt --all -- --check` no longer fails on those known formatting differences.
- Candidate lock generation no longer depends only on manifest/lock path changes; frontend and Tauri version-source changes also trigger synchronization.

### Candidate status

The 2.18.12 source/configuration and generated npm/Cargo lock metadata are synchronized, and the candidate branch contains the accessibility/Rust/CI hardening above. The candidate is **not yet publishable** until the exact final commit has observed green CI/browser-PWA/Rust/Android/iOS evidence plus fuzz, benchmark, packaged desktop, physical-device, accessibility/localization, security, screenshot, signing-status, checksum, provenance, and explicit approval evidence. See [`docs/release-blockers-current.md`](docs/release-blockers-current.md).

## [2.0.12] - 2026-08-19 (release candidate)

### Added

- Rust + Tauri 2 cross-platform native foundation with a TypeScript + React web companion.
- Native Windows, macOS, and Linux desktop targets.
- Tauri Android mobile target with an explicit Android API 24 minimum.
- Tauri iOS/iPadOS mobile target with an explicit iOS 14.0 minimum.
- Android init/development/APK+AAB command surface and iOS init/development/build/simulator/unsigned-archive command surface.
- Main CI Android ARM64 build validation and Apple-Silicon iOS simulator build validation.
- Tagged release validation for universal Android APK/AAB output and an unsigned iOS ARM64 device archive, in addition to web/Windows/macOS/Linux artifacts.
- Mobile safe-area, dynamic viewport, coarse-pointer 44px touch-target, and compact landscape styling layered over the existing responsive UI.
- `tauri-plugin-fs` native filesystem adapter used behind the bounded Rust export command for operating-system-selected desktop/mobile destinations.
- Android `content://` document-provider export handling without treating provider URIs as ordinary local filesystem paths.
- iOS security-scoped selected-file handling with explicit access release after native writes.
- Native secure random rolling and deterministic seeded rolling.
- Dice notation parser supporting custom sides, modifiers, `kh`, `kl`, `dh`, and `dl`.
- Quick d4, d6, d8, d10, d12, d20, and d100 controls.
- Saved tabletop presets and custom presets.
- Versioned shareable preset JSON files with custom-preset-only export, parser normalization, 1 MB/500-entry bounds, pre-read selected-file size rejection, validated import, fresh local IDs, and localized English/Hindi transfer feedback.
- Offline-first local history and settings persistence.
- History search, statistics, histogram, CSV export, and JSON export.
- Exact probability calculator for ordinary sums and manageable keep/drop expressions.
- Exact probability quartiles, median/mode/variance/standard-deviation helpers, configurable exact/at-most/at-least threshold probabilities, and pairwise independent distribution comparison with expected-value delta.
- Backup export and validated restore for history, custom presets, and settings.
- Native operating-system save/document dialogs for CSV/JSON exports through a dedicated bounded Rust command, while browser builds retain their ordinary download path.
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
- Browser integration coverage for roll → history → export, backup restore, Settings → About, live Hindi switching, and shared preset import → persistence → use → re-export journeys.
- Additional localization lifecycle coverage for persisted-locale startup, first-run Hindi onboarding, backup-driven locale restoration, clear-data locale reset, user-preset preservation, Hindi parser validation, Hindi backup/export failure feedback, preset transfer copy, release/version copy, and live shell/command-palette switching.
- Exact probability insight, threshold, pairwise-comparison, preset-file validation, and preset-transfer component regression coverage.
- Dependency-free real-browser production-bundle E2E smoke covering onboarding, rolling, history, real CSV download, reload persistence, keyboard command palette, probability, real backup download, clear-data flow, real file-input restore, and restored history.
- Extracted dependency-free CDP transport with Node tests for command routing, protocol errors, event waits/timeouts, and socket closure.
- Component keyboard/accessibility regression tests for command palette, onboarding, settings, large-history behavior, and root error recovery.
- Native/browser export-routing tests covering system-dialog cancellation, safe fallback behavior, payload/filename validation, selected-path extension validation where applicable, and user-safe export status feedback.
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
- Complete documentation hub plus deep application-flow, data-contract, maintainer-code, automation, policy, release-evidence, every-file, cross-platform setup, mobile export, and release references.
- Dependency-free high-confidence secret audit plus built-in Node self-tests, wired into CI and tagged release verification before dependency installation.
- Application version consistency audit across npm/frontend/Cargo/Tauri metadata plus release-tag/version agreement checks.
- Dependency-free repository policy audits for native capabilities, Tauri CSP/remote IPC, offline network sources, localized formatting, native runtime access, native command contracts, and direct manifest/lock consistency.
- Dedicated and aggregate GitHub Actions policy workflows, including release-tag policy/lock consistency checks.
- Accepted native export ADR documenting the least-privilege OS-dialog save boundary and rejected broader renderer filesystem alternatives.
- Release provenance manifest containing repository/tag/source commit/workflow identifiers, included in SHA-256 checksum verification.
- Release-candidate evidence template covering dependency integrity, CI/policy/fuzz/benchmarks, platform smoke, accessibility/localization, screenshots, signing, checksums, provenance, and final approval.
- Current release-blocker ledger separating implemented work from still-unobserved candidate evidence.
- Repository-governance guide covering branch protection rollout, labels, milestones, Discussions, security settings, and release review.
- Structured GitHub bug/feature/accessibility issue forms, public-issue routing, expanded CODEOWNERS, PR review checklist, support guidance, and optional funding metadata.
- GitHub CI with locked npm/Cargo dependency verification.
- Tag-driven cross-platform draft release packaging with ZIP archives, `RELEASE-METADATA.json`, and `SHA256SUMS.txt`.
- Tauri CSP and least-privilege capability configuration explicitly scoped to Linux, macOS, Windows, Android, and iOS.
- Native export trust-boundary documentation covering browser, desktop, Android, and iOS behavior, validation, cancellation, provider/file handling, and future-format review rules.
- Professional project documentation baseline.

### Changed

- Authoritative application version metadata in npm, frontend configuration, Cargo, and Tauri configuration is synchronized to `2.0.12` for the current candidate.
- DiceLab's declared platform scope is now Windows + macOS + Linux + Android + iOS/iPadOS + modern browsers from the shared Rust/Tauri/React codebase.
- The package description, public README, setup guide, release guide, roadmap, release-blocker ledger, native-export guide, code/data references, and exhaustive tracked-file reference now describe current mobile, exact-probability, preset-sharing, and evidence/signing boundaries.
- The native capability remains `core:default` while its platform scope now explicitly covers all five native operating-system targets.
- Native CSV/JSON/backup/preset-file export writes now use the shared runtime-aware save boundary; the preset-file serializer applies its own stricter 1 MB content contract before output.
- Native CSV/JSON/backup export writes now use Tauri's selected `FilePath` and native filesystem abstraction rather than a desktop-only `std::fs::write` assumption.
- The tagged release workflow now requires successful web, desktop, Android, and iOS artifact jobs before draft-release packaging.
- Android/iOS release workflow artifacts are labeled as release-validation outputs rather than being represented as Google Play/App Store-ready packages.
- The tag-driven release workflow runs documentation link/inventory audits, repository policy self-tests/audits, version/tag consistency, and release-verifier self-tests directly before artifact creation, so separate focused workflows cannot be the only protection on a release tag.
- Release web/desktop/mobile/draft jobs use explicit timeouts to prevent indefinitely hung candidate pipelines.
- TypeScript and Rust seeded modes use the same UTF-8 FNV-1a 32-bit seed hash and xorshift32 sequence so identical effective seeds reproduce identical deterministic values across web and native targets.
- Probability calculations advertised as exact reject raw-outcome counts that exceed JavaScript safe-integer precision; derived quartile/threshold/comparison views consume those guarded distributions rather than introducing alternate approximations.
- Roll, history, and probability presentation uses the selected DiceLab locale for explicit `Intl` number/date/time formatting instead of inheriting the host browser locale independently from UI language.
- Persistent shell navigation and command-palette definitions read the active catalog during rendering instead of capturing translated primitive strings when modules first load.
- Backup import validation rejects internally inconsistent roll totals, duplicate IDs, duplicate/out-of-range die indices, impossible die values, malformed timestamps, missing deterministic seeds, mismatched modifiers, and semantically incorrect keep/drop selections.
- Backup serialization enforces the same 5,000,000-byte UTF-8 limit as backup restore before browser/native output, while the generic native text transport retains its separate 6,000,000-byte cap.
- Browser-selected backup restore rejects files above the 5,000,000-byte contract from `File.size` before reading them, while decoded UTF-8 size is still checked after reading as defense in depth.
- Parser/probability/backup UI feedback resolves from stable error codes and catalog entries rather than raw exception messages.
- Imported and locally persisted settings normalize contradictory reduced-motion/animation state.
- Locale preferences are normalized to the reviewed English/Hindi set; missing or unsupported schema-v1 backup locale values fall back to English.
- Built-in preset copy follows the active catalog while user-created names, expressions, seeds, and history content remain unchanged.
- Local history and custom presets are validated, bounded, and deduplicated before use or persistence.
- History query logic is centralized in the domain layer so UI filtering, tests, and performance benchmarks share one implementation.
- History and backup exports use the dedicated native save command inside Tauri and preserve the existing Blob-download implementation in normal browsers.
- Tauri security/offline-network policy audits distinguish packaged production CSP from explicit loopback-only Vite/HMR development sources; production remains strict and non-loopback/broad-scheme development origins remain rejected.
- Normal CI and tagged web release verification self-test the browser automation infrastructure and require the real-browser smoke after the production build.
- The dependency-lockfile workflow revalidates direct lockfile edits as well as manifest/workflow changes, verifies locked Cargo metadata, checks generated diffs, and preserves exact generated lockfiles on a dedicated automation branch if protected `main` rejects its direct update.
- Generated npm/Cargo lock metadata now reflects application version `2.0.12`; Cargo's DiceLab package graph includes both `tauri-plugin-dialog` and the direct `tauri-plugin-fs` mobile export dependency.
- Repository-level audit commands are exposed through stable npm scripts for documentation, policy, version, secret, E2E-infrastructure, and release-package verification.
- Repository audit validates both Markdown links/anchors and exhaustive tracked-file documentation coverage.
- Contributor, pull-request, CODEOWNERS, README, ADR index, governance, release, roadmap, handoff, and maintainer-contract documentation reflect the current English/Hindi product, native command/security boundaries, probability tools, preset sharing, generated-lock rules, cross-platform targets, and 2.0.12 evidence-based release process.
- Release tags must match the synchronized declared application version before release dependencies/builds proceed.
- Release tags produce a draft GitHub release only after all required artifact jobs succeed; publication remains a deliberate maintainer action.
- Core product metadata is centralized for Settings/About consistency.

### Fixed

- Android native exports no longer depend on converting a document-provider `content://` selection into a normal filesystem path before writing.
- iOS native export writes explicitly release security-scoped selected-file access after the operation.
- Phone/tablet layouts account for safe-area insets around top content, bottom navigation, and modal overlays, including compact landscape conditions.
- DiceLab no longer generates a backup larger than its own documented 5 MB restore limit; oversized serialization fails before save/download with the stable localized backup-size error instead of producing an immediately un-restorable file.
- Oversized selected backup files are rejected before `File.text()` reads their contents into memory.
- Backups produced from a maximum-length 120-character user seed can be restored after DiceLab appends the deterministic sequence suffix.
- Persisted/imported keep/drop rolls verify the exact expected kept indices instead of accepting a forged mask with only the correct kept-die count and self-consistent total.
- History-limit input emits an integer clamped to 10–5,000 immediately, avoiding fractional live state that would normalize differently after reload.
- Custom preset IDs use `crypto.randomUUID()` when available and a collision-resistant timestamp/sequence fallback instead of a timestamp-only identifier.
- Settings release/version UI copy now has matching English/Hindi catalog keys for installed version, installed-version detail, release navigation, and manual-update guidance.
- The command-palette shortcut hint displays `Ctrl/⌘ K`, matching the implemented Ctrl-or-Command keyboard handler.
- Live English/Hindi switching refreshes persistent shell navigation and command-palette labels/details immediately without requiring a reload.
- The shell brand accessible name no longer appends a hardcoded English word during Hindi operation.
- Tauri CSP policy checks no longer falsely reject the legitimate explicit loopback Vite development origin while still rejecting the same origin in packaged production policy and rejecting non-loopback remote development sources.
- Offline-network CSP checks no longer falsely reject explicit loopback Vite/HMR development HTTP/WebSocket URLs while preserving production and broad-network-scheme restrictions.
- Corrupted or forged local-storage entries no longer flow directly into application state.
- Command-palette focus is trapped while open and restored to the invoking control after dismissal.
- Unexpected React render failures show a recovery surface instead of leaving the product with an unhandled blank interface.
- Backup-error localization always returns the caller-provided safe fallback if a future/unrecognized code reaches the mapper.
- History filter tests no longer use a query that ambiguously matches both a total and an expression suffix.
- Browser E2E navigation/reload synchronization waits for DevTools page-load events and surfaces `Page.navigate` network/policy errors explicitly instead of racing the previous document.
- Hindi UI no longer mixes localized interface copy with host-locale number/date/time formatting on roll, history, and probability surfaces.
- Contributor documentation no longer incorrectly states that English is the only shipped locale.
- ADR index includes all currently tracked architecture decisions rather than stopping after ADR-0003.
- Repository-audit command references for documentation/release self-tests have matching package scripts.
- Roadmap release engineering no longer marks the synchronized `src-tauri/Cargo.lock` regeneration as unfinished.

### Security

- Secure mode uses OS-backed native randomness on Tauri targets and Web Crypto in the browser companion.
- Untrusted dice expressions are bounded and validated.
- Shareable preset files are schema/kind/timestamp/count/text/expression bounded, reject oversized selected files before reading text, exclude application-owned built-ins and local identifiers, and do not modify unrelated application state.
- CSV exports neutralize formula-like untrusted `id`/`seed` cells even when formula markers follow leading whitespace, while generated negative numeric totals/modifiers remain numeric fields.
- Imported backups are schema-bounded and validated before replacing local state, with oversized selected files rejected before their text is read.
- Duplicate restored identifiers are rejected to avoid ambiguous application state.
- Native CSV/JSON exports use a purpose-built Rust command that accepts no frontend-supplied destination path/URI, allows only bounded CSV/JSON payloads, validates suggested filenames, revalidates normal selected-path extensions, and writes only to the operating-system-dialog-selected `FilePath`.
- Android content-provider URIs and iOS selected files stay behind the Rust/plugin boundary instead of being exposed as a general renderer filesystem capability.
- Native export failures shown by the UI use localized safe messages and do not expose a selected private filesystem path, file URL, or Android content URI.
- Structured logger redaction prevents normal operational events from serializing configured seeds, user content, backups, email/name fields, raw exception messages, or stacks.
- Storage/recovery diagnostics emit only stable event names and bounded safe metadata.
- CI/tagged builds run a self-tested high-confidence secret scanner that never prints matched credential values.
- The application recovery boundary logs only a fixed structured event from DiceLab rather than serializing raw exception contents.
- Native capability audits reject broad filesystem/shell/HTTP/process permission families, remote-origin capability scope, and wildcard/invalid window targets.
- Tauri configuration audits reject missing/self-unanchored CSP, wildcard sources, `unsafe-eval`, non-loopback remote script sources, dangerous remote-domain IPC, and remote production CSP network origins; development exceptions are explicit loopback-only.
- Native runtime and native-command audits keep Tauri API access, runtime probing, command names, command routing, and Rust handler entries within reviewed allowlists.
- Release lockfile consistency audit fails candidates whose direct manifest dependencies are not represented in committed lockfiles instead of silently resolving a different graph during release verification.
- The 2.0.12 tag workflow directly runs repository policy and documentation inventory gates before artifacts can be produced.
- Release provenance/checksum metadata ties packaged files to a tag/source commit/workflow run for draft review.
- Native content is constrained by a restrictive CSP.
- No broad filesystem, shell, HTTP, process, or network plugin permission is granted to the webview for mobile support.
- Android keystores, Apple certificates/provisioning material, store credentials, and other signing secrets are explicitly excluded from source-controlled release design.

### Candidate status

The 2.0.12 source/configuration now contains build paths for **Windows, macOS, Linux, Android, iOS/iPadOS, and modern browsers**, generated npm/Cargo locks synchronized to 2.0.12 including the mobile filesystem dependency, exact threshold/comparison probability tools, and versioned local preset sharing. The candidate is **not yet publishable** until the exact final commit has observed green CI/web E2E/Rust/Android/iOS build evidence plus fuzz/benchmark/physical-device/accessibility/security/screenshot/signing-status/checksum/provenance review. See [`docs/release-blockers-current.md`](docs/release-blockers-current.md).
