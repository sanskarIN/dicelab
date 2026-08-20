# DiceLab Exhaustive Repository File Reference

This document describes **every Git-tracked file** in DiceLab. The first column of each table contains the exact tracked path; `npm run docs:inventory` compares those entries with `git ls-files` and fails when a tracked file is missing from this reference or a documented path is no longer tracked.

For deeper behavioral context, also read:

- [`README.md`](README.md) — documentation hub;
- [`architecture.md`](architecture.md) — system architecture;
- [`application-flows.md`](application-flows.md) — end-to-end runtime flows;
- [`data-contracts.md`](data-contracts.md) — data/boundary contracts;
- [`code-reference.md`](code-reference.md) — maintainer code guide;
- [`automation-reference.md`](automation-reference.md) — scripts/workflows.

## Root repository files

| Path | Purpose and relationships |
| --- | --- |
| `.editorconfig` | Editor-neutral whitespace/indent/newline rules so contributors start from consistent formatting before Prettier/rustfmt. |
| `.env.example` | Safe environment-variable template/documentation. It must contain examples only, never real credentials or private deployment values. |
| `.gitattributes` | Git text/line-ending behavior for reproducible cross-platform checkouts. |
| `.gitignore` | Excludes dependencies, build output, local files, coverage, Tauri targets, and generated fuzz artifacts while allowing intentionally tracked lockfiles/configuration. |
| `.prettierrc.json` | Repository Prettier formatting preferences used by `npm run format` / `format:write`. |
| `CHANGELOG.md` | User-visible, security, localization, compatibility, and engineering changes for Unreleased/planned releases. Must not describe planned behavior as shipped. |
| `CODE_OF_CONDUCT.md` | Community behavior and enforcement expectations for contributors/issues/discussions. |
| `CONTRIBUTING.md` | Contributor workflow: setup, granular commits, quality commands, English/Hindi localization, accessibility, native/security boundaries, lockfiles, docs inventory, and release evidence. |
| `LICENSE` | MIT license governing DiceLab source/distribution. |
| `PRIVACY.md` | Product privacy model: offline/local storage, exports, diagnostics, and absence of required account/remote telemetry. Review when data handling changes. |
| `README.md` | Public project entry point: product overview, features, cross-platform setup, quality commands, architecture summary, syntax, privacy, contribution, documentation, and support links. |
| `ROADMAP.md` | Milestone checklist separating implemented work from evidence-gated verification/release items. |
| `SECURITY.md` | Security posture, trust boundaries, safe disclosure guidance, dependency/release expectations, native export rules, and private-reporting path. |
| `SUPPORT.md` | Public support/feature/bug routing, privacy-safe diagnostic expectations, private security routing, business/support contacts, and optional funding note. |
| `eslint.config.js` | ESLint flat configuration for TypeScript/React/repository source quality. `npm run lint` permits zero warnings. |
| `index.html` | Vite renderer HTML shell containing the React mount target plus manifest/theme/mobile/Apple install metadata and `viewport-fit=cover` safe-area support. |
| `package-lock.json` | npm-generated reproducible dependency graph. It must remain synchronized with `package.json`; do not hand-edit package resolution. |
| `package.json` | npm project metadata, direct dependencies/devDependencies, canonical development/quality commands, PWA policy checks, desktop Tauri commands, Android init/dev/build commands, iOS init/dev/build/simulator/archive commands, and release verification. |
| `tsconfig.app.json` | TypeScript rules for browser/application source and JSX compilation. |
| `tsconfig.json` | TypeScript solution/project-reference root connecting application and Node/config builds. |
| `tsconfig.node.json` | TypeScript rules for Node-side/build-tool configuration such as Vite/Vitest config. |
| `vite.config.ts` | React/Vite dev/build configuration including Tauri `TAURI_DEV_HOST` mobile/desktop dev host and HMR handling, env prefixes, native-source watch ignore, platform targets, minification, and debug sourcemaps. |
| `vitest.config.ts` | Vitest configuration, jsdom environment, setup-file wiring, and test discovery behavior. |
| `what_changed.md` | Current continuation/handoff entry point. Detailed historical milestones are preserved under `docs/handoffs/`. |

## Browser installation and PWA assets

| Path | Purpose and relationships |
| --- | --- |
| `public/apple-touch-icon.png` | 180×180 PNG used by iOS/iPadOS Add to Home Screen metadata. It is also part of the service-worker application shell. |
| `public/dicelab-icon.svg` | Scalable DiceLab browser/favicon install asset and service-worker application-shell resource. |
| `public/icon-192.png` | Standard 192×192 PNG PWA installation icon declared by the web manifest. |
| `public/icon-512.png` | Standard 512×512 PNG PWA installation icon; the manifest also marks it maskable for launcher-safe presentation. |
| `public/manifest.webmanifest` | PWA identity, standalone display modes, theme/background colors, categories, and root-relative local install icons. |
| `public/sw.js` | Production browser service worker using versioned DiceLab caches, same-origin navigation fallback, stale-while-revalidate static assets, and a precached install shell. |

## GitHub ownership, funding, issues, pull requests, and dependency metadata

| Path | Purpose and relationships |
| --- | --- |
| `.github/CODEOWNERS` | Routes default and sensitive native/security/release/policy/documentation review to `@sanskarIN`. |
| `.github/FUNDING.yml` | GitHub funding metadata pointing to optional Buy Me a Coffee support; donations do not gate product features. |
| `.github/ISSUE_TEMPLATE/accessibility.yml` | Structured accessibility issue form for keyboard, focus, screen-reader, zoom/text-scaling, contrast, and motion defects. |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Structured bug form collecting version/runtime/platform/reproduction/expected behavior and privacy-safe diagnostics; security issues are redirected away from public disclosure. |
| `.github/ISSUE_TEMPLATE/config.yml` | Disables blank issues and provides security, roadmap, and contributor contact links. |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Structured feature form centered on user need, offline/privacy/accessibility/cross-platform constraints, and alternatives. |
| `.github/dependabot.yml` | Dependabot ecosystem/update configuration. Generated dependency PRs still require normal CI/security/lockfile/compatibility review. |
| `.github/pull_request_template.md` | PR checklist for observed verification, tests, docs inventory, localization, accessibility, native/security policy, generated lockfiles, and release documentation. |
| `.github/release.yml` | GitHub generated-release-notes category/exclusion configuration; distinct from the build workflow at `.github/workflows/release.yml`. |

## GitHub Actions workflows

| Path | Purpose and relationships |
| --- | --- |
| `.github/workflows/capability-audit.yml` | Runs dependency-free Tauri capability self-tests and audits committed capability JSON for broad permission/window/origin expansion. |
| `.github/workflows/ci.yml` | Main push/PR CI: web secret/version/PWA/browser checks, locked npm quality/E2E, locked Rust fmt/test/Clippy, Android ARM64 APK/AAB compilation, and iOS Apple-Silicon simulator compilation. |
| `.github/workflows/codeql.yml` | GitHub CodeQL JavaScript/TypeScript static security analysis on push/PR and schedule. |
| `.github/workflows/fuzz.yml` | Manual/weekly Rust nightly `cargo-fuzz` parser campaign with Tauri Linux prerequisites and bounded 60-second execution. |
| `.github/workflows/localized-formatting-audit.yml` | Enforces that localized React surfaces use the shared `src/i18n/format.ts` number/date/time boundary. |
| `.github/workflows/lockfiles.yml` | Regenerates npm/Cargo lockfiles after manifest changes/manual dispatch; commits with configured identity and uses `automation/lockfiles` fallback if direct main push is rejected. |
| `.github/workflows/native-command-contract.yml` | Enforces renderer→Rust native command allowlist/routing/handler synchronization on source changes and release tags. |
| `.github/workflows/npm-audit.yml` | Runs locked npm install with scripts disabled then `npm audit --audit-level=high` on dependency changes, schedule, and manual dispatch. |
| `.github/workflows/offline-csp-audit.yml` | Rejects remote network CSP sources while permitting documented local Tauri IPC/asset mechanisms; also runs on release tags. |
| `.github/workflows/release-lockfile-consistency.yml` | Version-tag/manual gate checking direct manifest/lock consistency without silently regenerating the candidate dependency graph. |
| `.github/workflows/release-policy-audits.yml` | Re-runs core dependency-free repository policy boundaries on version tags/manual dispatch so release verification does not rely only on path-filtered PR checks. |
| `.github/workflows/release.yml` | `v*` release workflow: web verification/artifact, Windows/macOS/Linux bundles, universal Android APK/AAB validation artifacts, unsigned iOS device archive, ZIP packaging, provenance/checksums, and draft GitHub release upload. |
| `.github/workflows/repository-audit.yml` | Dependency-free repository invariant workflow for secret/doc/inventory/browser-infrastructure/version/release-verifier self-checks. |
| `.github/workflows/repository-policy-audit.yml` | Aggregate status for committed capability, Tauri security, localized formatting, and native runtime policy boundaries. |
| `.github/workflows/runtime-boundary-audit.yml` | Enforces approved production locations for Tauri core access and runtime-marker probing. |
| `.github/workflows/tauri-security-audit.yml` | Enforces baseline Tauri CSP and remote-domain IPC security configuration. |

## Documentation hub and engineering guides

| Path | Purpose and relationships |
| --- | --- |
| `docs/README.md` | Documentation navigation hub, maintenance rules, and reading paths for contributors, native/security work, localization/UI work, and release preparation. |
| `docs/accessibility.md` | Accessibility design/test/manual-review expectations: semantics, keyboard/focus, screen reader, motion, contrast, scaling, and release smoke. |
| `docs/application-flows.md` | Detailed runtime flows from startup through roll/history/probability/localization/export/backup/storage/clear/onboarding/error/logging/release verification. |
| `docs/architecture.md` | Current modular-monolith architecture, frontend/domain/service/i18n/native boundaries, persistence, randomness, backup, error/logging, E2E, policy, and release structure. |
| `docs/automation-reference.md` | Complete npm command, repository script, workflow, Dependabot/community automation, and evidence-interpretation reference. |
| `docs/capability-policy.md` | Tauri capability allow/deny policy, auditor behavior, CI, safe capability-change process, and relationship to native exports. |
| `docs/code-reference.md` | Maintainer guide to application bootstrap, every production UI/domain/i18n/service/native module, configuration, test naming, and change-routing ownership. |
| `docs/data-contracts.md` | Stable shapes, limits, validation invariants, storage/backup formats, locale/randomness/error/native-command/version/lockfile contracts. |
| `docs/development.md` | Day-to-day contributor/developer workflow, module conventions, Rust/frontend checks, localization/runtime/logging/dependency/documentation/version/governance rules. |
| `docs/e2e.md` | Dependency-free Chromium CDP E2E architecture, browser discovery, production preview flow, scenario, environment limitations, and debugging. |
| `docs/localization.md` | Typed English/Hindi catalog workflow, stable error localization, locale-aware formatting, persistence/backup behavior, review/checklist requirements. |
| `docs/lockfile-policy.md` | npm/Cargo manifest-to-lock rules, structural consistency audit, generation commands, release gate, and evidence requirements. |
| `docs/logging.md` | Local structured logging model, redaction/key policy, bounded context, safe operational events, and no-remote-telemetry design. |
| `docs/native-command-contract.md` | Reviewed `roll_expression` / `save_text_export` command allowlist, frontend adapters, audit rules, and safe process for adding commands. |
| `docs/native-exports.md` | Browser Blob download versus cross-platform Tauri OS-dialog/document-picker save architecture, URI/path validation, cancellation, failure semantics, tests, and security boundary. |
| `docs/offline-network-policy.md` | Offline-first CSP policy rejecting remote HTTP/HTTPS/WebSocket origins while allowing documented local Tauri mechanisms. |
| `docs/performance.md` | Performance principles, benchmark scenarios, measurement/evidence rules, large-history/probability budgets, and release interpretation. |
| `docs/release-blockers-current.md` | Current evidence-gated release blockers: locks, E2E/fuzz/benchmark/native platform/accessibility/security/screenshots/signing/artifact review. |
| `docs/release-candidate-evidence-template.md` | Fill-in release candidate record for dependency integrity, policy/CI, fuzzing, benchmarks, platform smoke, accessibility, screenshots, provenance/checksums, and final decision. |
| `docs/release.md` | Cross-platform version/lock prerequisites, clean-checkout checks, browser/desktop/mobile/localization smoke, tagging, draft packaging, signing/store distinctions, artifact verification, release notes, rollback. |
| `docs/repository-governance.md` | Branch protection, status checks, labels, milestones, Discussions, repository security settings, ownership, and release-governance rollout. |
| `docs/repository-policy-gates.md` | Index of executable architecture/security policies, self-tests, CI workflows, branch-protection guidance, and evidence interpretation. |
| `docs/runtime-boundary-policy.md` | Restricts production Tauri core/runtime detection to approved service adapters and documents how to add native features safely. |
| `docs/setup.md` | Web, Windows, macOS, Linux, Android, and iOS prerequisites plus local/mobile build commands and native export notes. |
| `docs/tauri-security-policy.md` | CSP self-anchor/wildcard/unsafe-eval/remote-script/remote-IPC policy and audit/review requirements. |
| `docs/testing.md` | Full frontend/domain/Rust/fuzz/static/security/E2E/benchmark/native-smoke/accessibility/manual/CI verification strategy. |
| `docs/troubleshooting.md` | Common local setup/build/runtime/browser/Rust problems and safe resolution guidance. |
| `docs/web-pwa.md` | Browser/PWA install architecture, service-worker cache strategy, Tauri exclusion, privacy/security boundaries, platform install behavior, policy commands, and release-candidate checks. |

## Architecture Decision Records

| Path | Purpose and relationships |
| --- | --- |
| `docs/adr/0001-modular-monolith.md` | Accepted decision for modular-monolith architecture combining Tauri native core and React web companion with explicit boundaries. |
| `docs/adr/0002-randomness-modes.md` | Accepted decision separating cryptographically secure randomness from reproducible deterministic seeded mode. |
| `docs/adr/0003-local-persistence.md` | Accepted decision to use versioned localStorage before introducing a database, with migration/trust-boundary consequences. |
| `docs/adr/0004-stable-error-localization-contract.md` | Accepted decision that stable error codes/context—not English exception prose—form the presentation/localization contract. |
| `docs/adr/0005-privacy-safe-local-logging.md` | Accepted decision for local-only structured diagnostics with sensitive-value redaction/bounds instead of remote telemetry/raw errors. |
| `docs/adr/0006-dependency-free-browser-e2e.md` | Accepted decision to use Node + Chromium CDP for the current production browser smoke without adding a browser-automation package dependency. |
| `docs/adr/README.md` | Complete ADR index, status definitions, and rules for adding/superseding durable decisions. |
| `docs/adr/native-export-boundary.md` | Accepted decision to use a dedicated OS-dialog-backed Rust text-save command instead of broad renderer filesystem access. |

## Localization review records

| Path | Purpose and relationships |
| --- | --- |
| `docs/localization/HINDI_REVIEW.md` | Hindi-specific translation, accessibility, number/date/time, persistence, backup, built-in/user-content, and regression review record. |

## Continuation handoffs

| Path | Purpose and relationships |
| --- | --- |
| `docs/handoffs/2026-08-19-documentation-completion.md` | This deep-documentation wave: docs architecture, exhaustive inventory enforcement, stale guide corrections, governance/command updates, and remaining release evidence. |
| `docs/handoffs/2026-08-19-native-localization.md` | Hindi/persisted locale/formatting, native export boundary, parser fuzzing, and lockfile-workflow milestone handoff. |
| `docs/handoffs/2026-08-19-policy-hardening.md` | Repository policy audits, localization lifecycle failures, collaboration metadata, lock consistency, and release evidence hardening handoff. |
| `docs/handoffs/2026-08-19-pre-native-exports.md` | Preserved earlier broad implementation/verification/release-engineering handoff copied byte-for-byte from its prior Git blob. |
| `docs/handoffs/README.md` | Chronological handoff index and rule that handoffs record implementation state rather than unobserved CI evidence. |

## Exhaustive-reference self-documentation

| Path | Purpose and relationships |
| --- | --- |
| `docs/repository-file-reference.md` | This file: exact path/purpose catalog for every Git-tracked file; validated against `git ls-files` by `scripts/check-file-reference.mjs`. |

## Repository automation scripts — browser protocol and E2E

| Path | Purpose and relationships |
| --- | --- |
| `scripts/cdp-session.mjs` | Dependency-free Chrome DevTools Protocol session abstraction for command routing, pending promises, event waiting, timeouts, and socket/session lifecycle. |
| `scripts/cdp-session.test.mjs` | Node self-tests for CDP command/event/error/timeout/socket behavior independent of browser availability. |
| `scripts/e2e-browser.mjs` | Drives the built production web app through real Chromium: onboarding, roll/history, downloads, reload persistence, command palette, probability, clear-data, file-input backup restore. |

## Repository automation scripts — documentation

| Path | Purpose and relationships |
| --- | --- |
| `scripts/check-doc-links.mjs` | Scans Markdown relative links/anchors and fails missing local targets or malformed percent encoding. External URLs are reviewed separately with network access. |
| `scripts/check-doc-links.test.mjs` | Synthetic self-tests for documentation link/anchor parsing and failure behavior. |
| `scripts/check-file-reference.mjs` | Uses `git ls-files -z` and this document's exact first-column paths to report undocumented tracked files or stale documented paths. |
| `scripts/check-file-reference.test.mjs` | Unit tests for inventory path parsing plus missing/stale/synchronized set comparison. |
| `scripts/check-file-reference.integration.test.mjs` | Integration regression running the inventory audit against the actual checked-out repository/reference. |

## Repository automation scripts — security/policy

| Path | Purpose and relationships |
| --- | --- |
| `scripts/check-capabilities.mjs` | Audits Tauri capability JSON and rejects remote-origin, wildcard/invalid windows, malformed permissions, and broad fs/shell/http/process permission families. |
| `scripts/check-capabilities.test.mjs` | Synthetic allowed/forbidden capability policy tests. |
| `scripts/check-capabilities.integration.test.mjs` | Runs capability policy against the committed capability directory. |
| `scripts/check-localized-formatting.mjs` | Scans localized UI source for direct host-default `toLocale*` / `Intl` use that should flow through `src/i18n/format.ts`. |
| `scripts/check-localized-formatting.test.mjs` | Synthetic localization-formatting policy tests. |
| `scripts/check-localized-formatting.integration.test.mjs` | Audits the committed App/component localized UI source. |
| `scripts/check-lockfile-consistency.mjs` | Structural direct dependency consistency audit for npm manifest/root lock metadata and Cargo manifest direct crates versus Cargo.lock package names. |
| `scripts/check-lockfile-consistency.test.mjs` | Tests npm missing/stale/range mismatches, Cargo dependency-section/alias parsing, lock package parsing, and missing direct crate detection. |
| `scripts/check-native-command-contract.mjs` | Audits static frontend Tauri command names/approved adapters and Rust `generate_handler!` allowlist completeness/duplicates. |
| `scripts/check-native-command-contract.test.mjs` | Synthetic native command allowlist/routing/handler policy tests. |
| `scripts/check-native-command-contract.integration.test.mjs` | Audits actual committed production TypeScript plus Rust handler command contract. |
| `scripts/check-offline-csp.mjs` | Audits all CSP directives for remote HTTP/HTTPS/WebSocket sources while allowing documented local Tauri IPC/asset endpoints. |
| `scripts/check-offline-csp.test.mjs` | Synthetic offline CSP local/remote source policy tests. |
| `scripts/check-offline-csp.integration.test.mjs` | Audits the actual committed Tauri CSP for offline-network compliance. |
| `scripts/check-policy-boundaries.mjs` | Aggregates capability, Tauri security, localized formatting, and native runtime audits into one prefixed finding set. |
| `scripts/check-policy-boundaries.integration.test.mjs` | Runs aggregate boundary audits against current committed repository state. |
| `scripts/check-pwa.mjs` | Audits PWA manifest/install metadata, safe local icon paths/files, required PNG/maskable assets, Apple metadata, offline shell caching, same-origin/GET-only service-worker behavior, production-only registration, and Tauri exclusion. |
| `scripts/check-pwa.test.mjs` | Dependency-free self-tests covering accepted PWA boundaries and representative install/cache/security regressions. |
| `scripts/check-runtime-boundaries.mjs` | Scans production TypeScript/TSX and restricts Tauri core imports plus `__TAURI_INTERNALS__` probing to reviewed adapter files. |
| `scripts/check-runtime-boundaries.test.mjs` | Synthetic allowed/forbidden native runtime source-placement tests. |
| `scripts/check-runtime-boundaries.integration.test.mjs` | Audits actual committed production TypeScript runtime boundaries. |
| `scripts/check-secrets.mjs` | High-confidence repository credential/private-key/tracked-env audit designed not to print matched secret values. |
| `scripts/check-secrets.test.mjs` | Safe synthetic self-tests for secret-detection behavior. |
| `scripts/check-tauri-security.mjs` | Audits Tauri security config for required CSP, self anchoring, no wildcard/unsafe-eval/remote script source, and no dangerous remote-domain IPC. |
| `scripts/check-tauri-security.test.mjs` | Synthetic Tauri CSP/IPC security policy tests. |
| `scripts/check-tauri-security.integration.test.mjs` | Audits actual committed `src-tauri/tauri.conf.json`. |

## Repository automation scripts — version/release

| Path | Purpose and relationships |
| --- | --- |
| `scripts/check-version-sync.mjs` | Verifies application version agreement across npm/frontend/Cargo/Tauri metadata and optional expected release tag. |
| `scripts/check-version-sync.test.mjs` | Self-tests version parsing/normalization/mismatch behavior. |
| `scripts/verify-release-packages.mjs` | Verifies `SHA256SUMS.txt`, safe relative filenames, artifact hashes, `RELEASE-METADATA.json` schema/project/tag/full-source-SHA and optional expected tag/commit. |
| `scripts/verify-release-packages.test.mjs` | Synthetic tests for checksum parsing, unsafe/duplicate names, metadata validation, digest mismatches, and release verification behavior. |

## Tauri/Rust crate and configuration

| Path | Purpose and relationships |
| --- | --- |
| `src-tauri/Cargo.lock` | Cargo-generated reproducible Rust dependency graph. Must be regenerated after manifest dependency changes; locked CI uses it as authoritative resolution. |
| `src-tauri/Cargo.toml` | Native crate package/library/build/runtime dependency manifest, Tauri features, dialog + filesystem plugins, and fuzzing feature gate. |
| `src-tauri/build.rs` | Tiny Tauri build-script entry point invoking `tauri_build::build()`. |
| `src-tauri/capabilities/default.json` | Minimal `core:default` capability for the `main` window explicitly scoped to Linux, macOS, Windows, iOS, and Android; broad renderer filesystem/shell/network permissions remain absent. |
| `src-tauri/tauri.conf.json` | Tauri product/version/window/build/bundle/CSP configuration for desktop and mobile; defines Android API 24 and iOS 14.0 minimums and is audited by security/offline policies. |
| `src-tauri/icons/icon.png` | Binary application icon used by README branding and Tauri bundle metadata. Source-controlled product asset, not generated documentation. |

## Rust native implementation and fuzzing

| Path | Purpose and relationships |
| --- | --- |
| `src-tauri/src/lib.rs` | Cross-platform native parser/engine/randomness and Tauri command trust boundary: mobile entry point, `roll_expression`, `save_text_export`, dialog-selected desktop paths/Android content URIs/iOS security-scoped files through `tauri-plugin-fs`, tests, seeded parity, parser invariants/fuzz hook. |
| `src-tauri/src/main.rs` | Minimal desktop executable entry point delegating to the library runner; mobile entry uses the library's `tauri::mobile_entry_point`. |
| `src-tauri/fuzz/Cargo.toml` | Separate cargo-fuzz manifest so fuzz-only tooling/dependencies remain outside normal app crate usage. |
| `src-tauri/fuzz/README.md` | Nightly/cargo-fuzz setup, bounded campaign command, corpus/artifact policy, and deterministic-regression follow-up guidance. |
| `src-tauri/fuzz/fuzz_targets/parser.rs` | Coverage-guided parser target feeding arbitrary UTF-8 into the production normalization/reparse invariant hook. |

## Frontend application coordinator and integration tests

| Path | Purpose and relationships |
| --- | --- |
| `src/App.tsx` | Cross-surface application coordinator: views, expression/history/settings/presets, locale/theme/motion, keyboard palette, roll service, backup import/export, clear-data, onboarding. |
| `src/App.integration.test.tsx` | Main application integration journeys covering cross-component behavior such as roll/history/export/backup/About navigation. |
| `src/App.locale-backup.integration.test.tsx` | Verifies backup restoration switches live locale and preserves restored user-created preset text. |
| `src/App.locale-clear.integration.test.tsx` | Verifies clear-all-data resets Hindi state/document language/onboarding back to default English behavior. |
| `src/App.locale-onboarding.integration.test.tsx` | Verifies persisted Hindi preference applies to first-run onboarding before completion. |
| `src/App.locale-startup.integration.test.tsx` | Verifies persisted Hindi settings are active on the application's first render with localized built-ins/document language. |
| `src/App.localization.integration.test.tsx` | Verifies live English→Hindi switching localizes built-ins while preserving user-created preset name/description exactly. |
| `src/main.tsx` | React renderer bootstrap mounting `App` under the root error boundary, loading shared/mobile styles, then requesting guarded production-browser PWA registration. |
| `src/mobile.css` | Mobile Tauri/web ergonomics layered over shared styling: safe-area insets, dynamic viewport height, coarse-pointer 44px targets, mobile modal/bottom-navigation inset handling, and compact landscape behavior. |
| `src/styles.css` | Global product design system/layout/responsive/component/focus/theme/motion/histogram/probability styling consumed by React surfaces and root data attributes. |
| `src/vite-env.d.ts` | Vite client type declarations enabling typed `import.meta.env` access such as the production-mode PWA registration guard. |

## React components and component tests

| Path | Purpose and relationships |
| --- | --- |
| `src/components/AboutPanel.tsx` | About/privacy/support/license/repository/funding/version/credit surface using centralized product metadata and localized copy. |
| `src/components/AppErrorBoundary.tsx` | Last-resort React render recovery with privacy-safe logging and reload action that does not clear user data. |
| `src/components/AppErrorBoundary.test.tsx` | Regression coverage for root recovery UI/logging behavior after an unexpected render failure. |
| `src/components/AppShell.tsx` | Desktop sidebar/mobile bottom-nav application shell, `AppView` contract, active-page semantics, main landmark, quick-actions trigger, and credit. |
| `src/components/CommandPalette.tsx` | Keyboard modal for navigation/expression quick actions with search, focus trap, Escape close, and focus restoration. |
| `src/components/CommandPalette.test.tsx` | Keyboard/accessibility regression coverage for command palette focus lifecycle and dismissal. |
| `src/components/HistoryPanel.tsx` | History filter/statistics/histogram/progressive rows, locale-aware values/timestamps, CSV/JSON export feedback, and clear-history confirmation. |
| `src/components/HistoryPanel.test.tsx` | History component regressions including progressive rendering/filter behavior and export/clear interactions. |
| `src/components/HistoryPanel.export.localization.test.tsx` | Hindi success/failure export-status regressions ensuring raw browser error details are not shown. |
| `src/components/Onboarding.tsx` | First-run modal explaining product concepts and invoking onboarding completion; copy follows active locale. |
| `src/components/Onboarding.test.tsx` | Dialog semantics/initial-focus accessibility regression for onboarding. |
| `src/components/ProbabilityPanel.tsx` | Exact probability UI, examples, localized validation, summary statistics, bounded chart rendering, and locale-aware values. |
| `src/components/ProbabilityPanel.test.tsx` | Probability presentation regression including English/Hindi large-number grouping. |
| `src/components/RollWorkspace.tsx` | Main roll expression/quick dice/result/preset surface with immediate parser validation, secure/seeded status, kept/dropped dice, and locale formatting. |
| `src/components/RollWorkspace.test.tsx` | Roll-result localization/presentation component regression. |
| `src/components/RollWorkspace.validation.localization.test.tsx` | Hindi invalid-expression correction and disabled-roll regression. |
| `src/components/SettingsPanel.tsx` | Theme/language/accessibility/random/seed/history-limit/data backup/import/clear/About/version/release settings surface with safe status handling. |
| `src/components/SettingsPanel.test.tsx` | Settings component regressions for preference changes, backup export status, release/About actions, and related behavior. |
| `src/components/SettingsPanel.backup.localization.test.tsx` | Hindi backup import/export failure regressions proving stable localized errors and no raw private/native details. |

## Product metadata

| Path | Purpose and relationships |
| --- | --- |
| `src/config/app.ts` | Central product name/version/public URLs/support/funding metadata reused by UI and checked by the version-sync script. |

## TypeScript domain implementation, tests, and benchmarks

| Path | Purpose and relationships |
| --- | --- |
| `src/domain/types.ts` | Shared expression/die/roll/preset/probability/settings/random/theme/locale types and `DEFAULT_SETTINGS`. |
| `src/domain/parser.ts` | Dice notation parser/normalizer, limits, selection-code mapping, and stable `DiceExpressionError` code/context contract. |
| `src/domain/parser.test.ts` | Parser correctness, bounds, normalization, malformed input, and generated normalization/case/whitespace invariants. |
| `src/domain/parser.bench.ts` | Parser throughput benchmark using representative valid expressions. |
| `src/domain/engine.ts` | Pure roll engine and keep/drop index selection with injected RNG/time/ID and stable index tie-breaking. |
| `src/domain/engine.test.ts` | Roll totals/modifiers/selection semantics and deterministic engine behavior tests. |
| `src/domain/random.ts` | Browser `SecureRandomSource` (Web Crypto rejection sampling), deterministic `SeededRandomSource`, and UTF-8 FNV-1a seed hash. |
| `src/domain/random.test.ts` | Bounded RNG behavior and deterministic/cross-runtime seed/hash reference-vector tests. |
| `src/domain/random.bench.ts` | Seeded and browser-secure random-generation benchmark scenarios. |
| `src/domain/history.ts` | Pure reusable history filter by normalized query/expression/total semantics. |
| `src/domain/history.test.ts` | History filtering/order/query regression coverage. |
| `src/domain/history.bench.ts` | 5,000-record history filtering benchmark. |
| `src/domain/statistics.ts` | Pure count/mean/median/min/max/frequency/percentage aggregation over roll history. |
| `src/domain/statistics.test.ts` | Statistical summary and observed-frequency correctness tests. |
| `src/domain/statistics.bench.ts` | 5,000-record statistics benchmark. |
| `src/domain/probability.ts` | Exact ordinary-sum DP and bounded keep/drop enumeration, safe-integer guard, expected value, stable probability error codes. |
| `src/domain/probability.test.ts` | Exact distribution/expected-value/complexity/safe-integer/error-code regression coverage. |
| `src/domain/probability.bench.ts` | Ordinary and keep/drop probability performance benchmarks within supported budgets. |
| `src/domain/persistence.ts` | Runtime persisted roll/preset validators checking structure, expression, timestamps, dice indices/ranges, kept counts, totals, seed/mode, text bounds. |

## Internationalization implementation and tests

| Path | Purpose and relationships |
| --- | --- |
| `src/i18n/en.ts` | English source catalog and `MessageCatalog` structural contract for user-facing copy/dynamic message helpers. |
| `src/i18n/hi.ts` | Complete reviewed Hindi catalog matching `MessageCatalog`; technical identifiers/dice syntax stay stable where appropriate. |
| `src/i18n/index.ts` | Supported-catalog registry, active locale state, live exported `messages`, catalog lookup, and `setLocale()`. |
| `src/i18n/index.test.ts` | English default, Hindi lookup/dynamic helper, and live active-catalog/locale switching tests. |
| `src/i18n/format.ts` | Explicit `en-US` / `hi-IN` Intl mapping and shared integer/decimal/date-time/time presentation helpers. |
| `src/i18n/format.test.ts` | Locale mapping, English versus Indian grouping, and decimal formatting regressions. |
| `src/i18n/errors.ts` | Stable parser/probability/backup error code/context to active localized message mapping with safe unknown fallback. |
| `src/i18n/errors.test.ts` | Localized error mapper coverage independent of developer-oriented exception prose. |

## Application services and tests

| Path | Purpose and relationships |
| --- | --- |
| `src/services/runtime.ts` | Single production Tauri runtime detector shared by desktop and mobile; direct marker probing elsewhere is blocked by policy. |
| `src/services/runtime.test.ts` | Browser versus mocked Tauri runtime detection regression. |
| `src/services/pwa.ts` | Production browser PWA registration adapter enforcing Vite production mode, non-Tauri runtime, service-worker availability, and secure/loopback origin before registering `/sw.js`. |
| `src/services/pwa.test.ts` | PWA registration regression coverage for HTTPS/localhost eligibility, insecure/dev/Tauri exclusion, root-scope registration, and failure-closed behavior. |
| `src/services/roll-service.ts` | Browser/native roll adapter, effective seed sequence construction, Tauri `roll_expression` invocation, TypeScript RNG selection, and shared result adaptation. |
| `src/services/storage.ts` | Versioned localStorage keys, validated/bounded history/custom presets/settings, localized built-ins, onboarding marker, clear operation, and safe storage-failure logging. |
| `src/services/storage.test.ts` | Corrupt/malformed storage recovery, setting/locale normalization, bounded data, built-in/custom preset behavior, and persistence regressions. |
| `src/services/export.ts` | History CSV/JSON serialization, spreadsheet-formula neutralization, backup schema create/parse/validate, browser download, and cross-platform Tauri `save_text_export` routing. |
| `src/services/export.test.ts` | Browser/native text export routing, cancellation, serialization, and safe export request behavior tests. |
| `src/services/backup.test.ts` | Backup schema/bounds/duplicates/invariants/settings/locale/legacy compatibility/round-trip and hostile input regression coverage. |
| `src/services/logger.ts` | Local structured log record creation, event normalization, recursive redaction/bounds, Error-type-only serialization, and console severity routing. |
| `src/services/logger.test.ts` | Sensitive-key/raw-error/context-depth/size redaction and structured logger behavior tests. |

## Shared frontend test setup

| Path | Purpose and relationships |
| --- | --- |
| `src/test/setup.ts` | Shared Vitest/jsdom setup, DOM assertions, and browser API shims needed consistently by component/integration tests. |

## Inventory maintenance

When a file is added, renamed, or deleted:

1. update this document in the same change;
2. keep the exact tracked path in the first table column using backticks;
3. explain what the file owns and its important boundaries/relationships;
4. run `npm run docs:inventory:test`;
5. run `npm run docs:inventory`;
6. run `npm run docs:check` if documentation links changed.

The inventory audit intentionally uses Git rather than a hand-maintained directory list, so a newly tracked file cannot be silently omitted from documentation once the audit is part of CI.
