# DiceLab Maintainer Code Reference

This guide explains production code ownership and dependency direction. For every tracked file, see [`repository-file-reference.md`](repository-file-reference.md); for stable shapes and compatibility rules, see [`data-contracts.md`](data-contracts.md).

## Dependency direction

```text
React components
      ↓
App coordinator / application services
      ↓
TypeScript domain

Localization/configuration are shared presentation/product boundaries.
Tauri-native access stays behind reviewed service adapters.
```

Domain code must not import React, localStorage, Tauri, or UI catalogs. Components should not duplicate parser, persistence, probability, or native validation.

## Application bootstrap

### `src/main.tsx`

Renderer entry point. Loads global/mobile styles, mounts `App` beneath `AppErrorBoundary`, and requests guarded production-browser PWA registration.

### `src/App.tsx`

Cross-surface coordinator. Owns view/expression/history/settings/preset state, locale/theme/motion application, global keyboard shortcut handling, rolling, backup operations, preset transfer, clear-data, and onboarding.

Shareable preset import is deliberately duplicate-safe: parsed shared presets are normalized and compared with current local preset content before fresh local IDs/timestamps are assigned. Re-importing the same normalized preset therefore does not create another local copy.

Keep business mathematics in `src/domain/` and runtime I/O in `src/services/` rather than growing `App.tsx` into a second domain layer.

## UI components

### `src/components/AppShell.tsx`

Desktop sidebar/mobile bottom-navigation shell, main landmark, active-page semantics, command-palette trigger, and product credit.

### `src/components/RollWorkspace.tsx`

Primary dice/preset surface:

- quick dice and expression input;
- parser-backed validation;
- roll busy/error/result presentation;
- secure/seeded status;
- locale-aware roll values/times;
- custom preset creation/deletion;
- shareable preset import/export controls and safe localized status.

It delegates actual rolling and preset-file I/O through callbacks.

### `src/components/HistoryPanel.tsx`

History/search/statistics/export surface. It owns:

- domain-backed query filtering;
- full-filtered-set summary statistics;
- expression activity analytics from `history-analytics.ts`;
- bounded top-expression rendering with visible/total count indication;
- observed-total histogram;
- progressive 200-row roll rendering;
- locale-aware values/timestamps;
- filtered CSV/JSON export;
- clear-history confirmation.

Expression analytics and histogram visualization never reduce the data used by statistics or export.

### `src/components/ProbabilityPanel.tsx`

Exact probability exploration surface. It owns:

- exact distribution input/calculation;
- localized validation failures;
- expected value/range/outcomes;
- P25/P50/P75 and standard deviation;
- exact/at-most/at-least threshold analysis;
- independent A/B comparison expression;
- `P(A>B)`, `P(A=B)`, `P(A<B)`, expected-value delta;
- an accessible stacked comparison meter whose `aria-label` carries all three probabilities;
- bounded distribution chart rendering.

Distribution construction limits remain in `probability.ts`; derived statistics and comparison math remain pure domain modules.

### `src/components/SettingsPanel.tsx`

Theme, locale, accessibility, randomness, seed, history-limit, backup import/export, clear-data, version/release, and About controls.

### `src/components/CommandPalette.tsx`

Keyboard quick-actions dialog with search, focus trap, Escape handling, and focus restoration.

### `src/components/Onboarding.tsx`

First-run localized product introduction and onboarding completion action.

### `src/components/AboutPanel.tsx`

Product identity, privacy, license, support, repository, funding, version, and credit using centralized metadata.

### `src/components/AppErrorBoundary.tsx`

Last-resort render recovery. Logs only a safe structured event and offers reload without clearing local data.

## Product metadata

### `src/config/app.ts`

Central product name/version/public URLs/support/funding metadata. `APP_VERSION` participates in the synchronized application-version contract.

## Domain layer

### `src/domain/types.ts`

Shared expression/die/roll/preset/probability/settings/random/theme/locale types and default settings.

### `src/domain/parser.ts`

Authoritative TypeScript dice-notation parser/normalizer and stable `DiceExpressionError` code/context contract.

### `src/domain/engine.ts`

Pure roll/selection engine with injected RNG/time/ID and deterministic keep/drop tie-breaking.

### `src/domain/random.ts`

Browser secure Web Crypto rejection-sampling RNG plus deterministic seeded xorshift32/FNV-1a implementation shared by compatibility vectors with Rust.

### `src/domain/history.ts`

Pure history filter shared by UI/tests/benchmarks.

### `src/domain/history-analytics.ts`

Pure expression-level history aggregation. For each expression it computes:

- roll count;
- percentage of the active collection;
- mean total;
- minimum/maximum;
- latest timestamp.

Results sort by count descending, then most-recent activity, then expression. The module does not persist data or format locale-specific output.

### `src/domain/statistics.ts`

Pure overall roll count/mean/median/min/max/frequency/percentage aggregation.

### `src/domain/probability.ts`

Exact interactive distribution engine: ordinary sums use dynamic programming; bounded keep/drop expressions enumerate raw outcomes. It refuses unsafe-integer or configured complexity overflows.

### `src/domain/probability-insights.ts`

Pure derived exact statistics: quantiles, median/modes, variance/standard deviation, and threshold probabilities.

### `src/domain/probability-comparison.ts`

Pure pairwise independent-distribution comparison computing left-higher/tie/right-higher probability and expected-value delta without raw cross-product dice enumeration.

### `src/domain/persistence.ts`

Runtime validation for persisted/imported roll/preset records including expression, timestamps, die ranges/indices, exact keep/drop mask, totals, seed/mode, and text bounds.

## Internationalization layer

### `src/i18n/en.ts`

English source catalog and structural `MessageCatalog` contract.

### `src/i18n/hi.ts`

Reviewed Hindi implementation of the complete catalog contract.

### `src/i18n/index.ts`

Catalog registry, active locale state, live `messages` binding, and `setLocale()`.

### `src/i18n/format.ts`

Explicit `en-US` / `hi-IN` number/date/time formatting boundary.

### `src/i18n/errors.ts`

Stable parser/probability/backup error-code to localized-copy mapping with safe unknown fallback.

## Service layer

### `src/services/runtime.ts`

Single production Tauri-runtime detector. Direct runtime-marker probing elsewhere is blocked by policy.

### `src/services/roll-service.ts`

Browser/native roll adapter. Builds effective deterministic seeds, invokes the static native `roll_expression` command in Tauri, or uses TypeScript RNG/engine in browsers.

### `src/services/storage.ts`

Versioned localStorage adapter and normalization boundary for history, custom presets, settings, built-ins, onboarding, and clear-data behavior.

### `src/services/export.ts`

History CSV/JSON serialization, backup schema, browser download, and native `save_text_export` routing. The renderer never supplies an arbitrary native destination path.

### `src/services/preset-file.ts`

Versioned shareable preset-file boundary. It:

- exports custom presets only;
- omits local IDs/timestamps and application-owned built-ins;
- parser-normalizes expressions;
- caps content at 1,000,000 UTF-8 bytes and 500 entries;
- checks selected `File.size` before reading oversized input;
- validates kind/schema/timestamp/text/expression rules;
- trims imported text;
- computes normalized content keys for duplicate detection;
- skips content already present locally and duplicate rows within the same import.

This format shares reusable setups only; it is not a full application-state backup.

### `src/services/pwa.ts`

Production-only non-Tauri service-worker registration boundary with secure/loopback origin rules.

### `src/services/logger.ts`

Local-only structured logger with bounded/redacted context and Error-type-only serialization.

## Styling and test environment

### `src/styles.css`

Global design system/layout/focus/theme/motion styles plus roll/history analytics/histogram/probability comparison visualization rules and responsive breakpoints.

### `src/mobile.css`

Safe-area, dynamic-viewport, coarse-pointer target, modal/bottom-nav, and compact landscape mobile overrides.

### `src/test/setup.ts`

Shared Vitest/jsdom setup and browser API shims.

## Native Rust layer

### `src-tauri/src/main.rs`

Minimal executable entry point delegating to the library runner.

### `src-tauri/src/lib.rs`

Native trust boundary: parser/engine/randomness, `roll_expression`, bounded `save_text_export`, OS dialog handling, desktop paths, Android `content://`, iOS security-scoped files, native tests/parity/invariants, and fuzz hook.

### `src-tauri/Cargo.toml`

Native crate manifest and direct dependencies.

### `src-tauri/Cargo.lock`

Cargo-generated reproducible dependency graph. Never hand-edit the graph to make a version/dependency gate appear synchronized.

### `src-tauri/tauri.conf.json`

Product version, window/build/bundle/mobile minimums, and CSP configuration.

### `src-tauri/capabilities/default.json`

Least-privilege `core:default` main-window capability across Linux/macOS/Windows/Android/iOS.

## Fuzz target

`src-tauri/fuzz/` contains the separate cargo-fuzz package, parser target, and local workflow documentation. Actionable fuzz discoveries should become deterministic regressions.

## Configuration

- `vite.config.ts` — React/Vite + Tauri/mobile dev/build behavior.
- `vitest.config.ts` — Vitest/jsdom configuration.
- `eslint.config.js` — zero-warning TypeScript/React lint policy.
- `tsconfig*.json` — TypeScript solution/application/Node rules.
- `.prettierrc.json`, `.editorconfig`, `.gitattributes` — formatting/editor/line-ending consistency.
- `.env.example` — safe environment template only.
- `.gitignore` — generated/dependency/build/local/fuzz exclusions.

## Test naming map

- `*.test.ts` / `*.test.tsx` — unit/component tests;
- `*.integration.test.tsx` — cross-component/storage application journeys;
- `*.bench.ts` — Vitest benchmarks;
- `scripts/*.test.mjs` — dependency-free Node tooling tests;
- `scripts/*.integration.test.mjs` — committed-repository audit integration tests;
- `src-tauri/fuzz/fuzz_targets/*` — coverage-guided fuzz targets;
- Rust `#[cfg(test)]` in `lib.rs` — native/parser/RNG/export/invariant tests.

The real-browser `scripts/e2e-browser.mjs` additionally verifies expression analytics and exact A/B comparison visualization in the built production web target.

## Change routing cheat sheet

| Change | Primary implementation | Also review |
| --- | --- | --- |
| Dice syntax/bounds | `domain/parser.ts`, Rust | i18n errors, persistence, probability, parity/fuzz/docs |
| Keep/drop semantics | `domain/engine.ts`, Rust | probability/persistence/seeded regressions |
| Randomness | `domain/random.ts`, Rust, roll service | vectors/security/UI copy |
| History analytics | `domain/history-analytics.ts`, `HistoryPanel.tsx` | locale formatting, component/E2E/performance/docs |
| Probability analysis | `domain/probability*.ts`, `ProbabilityPanel.tsx` | exactness limits, accessibility, tests/E2E/docs |
| Preset sharing | `services/preset-file.ts`, `App.tsx`, `RollWorkspace.tsx` | parser/local limits/dedupe/i18n/tests/contracts |
| Settings field | types/storage/Settings UI | backup/defaults/tests/docs/migration |
| Locale/copy | `i18n/en.ts`, `i18n/hi.ts` | formatter/UI tests/review record |
| Export/backup | `services/export.ts` | Rust command/security/tests/release smoke |
| Native command | focused service adapter + Rust | command/runtime/capability/CSP audits/docs |
| Release/version | manifests/config + generated locks | version audit/changelog/roadmap/blockers/evidence |
