# DiceLab Maintainer Code Reference

This reference explains the production code by responsibility and dependency direction. For every tracked file—including tests, workflows, metadata, and generated locks—see [`repository-file-reference.md`](repository-file-reference.md). For end-to-end behavior see [`application-flows.md`](application-flows.md); for stable shapes/limits see [`data-contracts.md`](data-contracts.md).

## Dependency direction

The intended frontend dependency direction is approximately:

```text
React components
      ↓
App coordinator / application services
      ↓
TypeScript domain

Localization/configuration are shared presentation/product metadata boundaries.
Tauri-native access stays behind reviewed service adapters.
```

Avoid reversing this direction. Domain code should not import React, localStorage, Tauri, or UI catalogs. Components should not duplicate parser/persistence/native validation.

## Application bootstrap

### `src/main.tsx`

Browser/renderer entry point. It imports global styles and mounts `App` beneath `AppErrorBoundary` into the HTML root element. Keep startup composition small so unexpected rendering failures remain inside the recovery boundary.

### `src/App.tsx`

Application coordinator. It owns cross-surface state and operations that require more than one component/service:

- current view;
- current dice expression;
- history;
- settings;
- localized built-in + custom presets;
- command-palette visibility;
- onboarding visibility;
- roll busy/error state;
- deterministic sequence counter.

It coordinates startup persistence loading, locale activation, theme/motion/document metadata, keyboard shortcuts, runtime-agnostic rolling, preset mutation, shareable preset import/export, locale switching, backup export/import, clear-all-data, and onboarding completion.

Imported shareable presets receive fresh local IDs and timestamps before being merged into the bounded local collection. Export deliberately shares only custom preset content—not local IDs, timestamps, built-ins, history, or settings.

Do not turn `App.tsx` into a second domain layer. New dice/business rules belong in `src/domain/`; new platform I/O belongs in `src/services/`.

## UI components

### `src/components/AppShell.tsx`

Responsive application chrome. Defines the `AppView` union (`roll`, `history`, `probability`, `settings`, `about`), desktop sidebar, mobile bottom navigation, command-palette trigger, main landmark, active-page semantics, and product credit.

Navigation labels are catalog-backed; the shell receives navigation callbacks instead of owning router/persistence state.

### `src/components/RollWorkspace.tsx`

Primary dice interaction surface. Responsibilities:

- quick-die buttons;
- expression input;
- immediate parser validation and localized correction messages;
- roll submit/busy state presentation;
- current result total/dice/kept-dropped display;
- secure/seeded mode status;
- locale-aware result/time/modifier formatting;
- custom preset creation controls;
- built-in/custom preset cards and custom deletion affordance;
- shareable preset-file import/export controls;
- localized, privacy-safe preset transfer status.

The component does not parse preset files or choose browser versus native output. It delegates those operations through coordinator callbacks, just as rolling remains behind its application/service boundary.

### `src/components/HistoryPanel.tsx`

History/search/statistics/export surface. Responsibilities:

- query input and domain filter call;
- full filtered-set statistics;
- progressive 200-row rendering window;
- observed histogram;
- locale-aware totals/counts/timestamps;
- filtered CSV/JSON serialization requests;
- runtime-agnostic `saveTextExport` call;
- safe localized success/failure status;
- two-step history clear confirmation.

UI pagination must never silently reduce statistics or export scope: those continue to use the full filtered collection.

### `src/components/ProbabilityPanel.tsx`

Exact probability exploration surface. It owns:

- primary expression input and exact distribution calculation;
- safe localized parser/probability errors;
- example expressions;
- expected value/range/outcome summary;
- exact P25/P50/P75 quantiles and standard deviation;
- configurable exact `P(X = n)`, `P(X ≤ n)`, and `P(X ≥ n)` threshold analysis;
- an independent comparison expression with `P(A > B)`, `P(A = B)`, `P(A < B)`, and expected-value delta;
- bounded visible chart rows and locale-aware probability/number formatting.

Distribution construction/complexity policy remains in `src/domain/probability.ts`. Derived statistics and comparison mathematics remain in `probability-insights.ts` and `probability-comparison.ts`, keeping the React component focused on state and presentation.

### `src/components/SettingsPanel.tsx`

Settings/data-management surface. It exposes:

- theme selection;
- English/Hindi locale selection;
- reduced-motion and animation controls;
- secure/seeded mode selection;
- bounded seed input when seeded;
- history retention limit;
- backup export;
- JSON file backup import;
- confirmed clear-all-data action;
- release/version/About navigation information.

Backup errors are mapped through stable backup codes; unknown export failures use generic localized messages. File-input value is reset after selection so the same file can be chosen again.

### `src/components/CommandPalette.tsx`

Keyboard quick-actions dialog. Provides navigation and useful expression shortcuts. It owns modal focus management, filtering/selection interaction, Escape behavior, and focus restoration. Global open/close shortcuts live in `App.tsx`.

### `src/components/Onboarding.tsx`

First-run dialog describing key product concepts and completing onboarding through a callback. Copy follows the already-active locale. Accessibility tests protect dialog semantics and initial focus.

### `src/components/AboutPanel.tsx`

Product identity/privacy/support/funding/repository/license information. It reads centralized metadata from `src/config/app.ts` rather than duplicating version/URL constants.

### `src/components/AppErrorBoundary.tsx`

Last-resort React render recovery. It should handle unexpected rendering failures only. It emits a fixed safe operational log event and shows a reload-based recovery surface without deleting local data.

Expected parser/storage/import/export/native failures belong closer to their source.

## Product metadata

### `src/config/app.ts`

Central application metadata used by About/Settings and version consistency checks. Keep application name/version and public project/support URLs here when multiple UI surfaces need them.

The declared version must remain synchronized with npm, Cargo, and Tauri configuration.

## Domain layer

### `src/domain/types.ts`

Shared domain contracts and default settings. This is the central type vocabulary for expressions, dice rolls, presets, probability distributions, randomness modes, themes, locales, and settings.

Changing a persisted/shared interface here requires reviewing storage validation, backup compatibility, UI, tests, and documentation.

### `src/domain/parser.ts`

Authoritative TypeScript dice-notation parser and normalizer. It:

- recognizes optional count, required `dSIDES`, optional keep/drop clause, optional signed modifier;
- enforces product bounds;
- converts compact selection codes to semantic selection kinds;
- emits a normalized expression;
- throws `DiceExpressionError` with stable machine-readable codes/context.

Do not use ad-hoc component regular expressions for dice validity.

### `src/domain/engine.ts`

Pure roll/selection engine. It accepts a `RandomSource`, rolls each die, deterministically chooses kept indices (stable original-index tie-break), computes subtotal/modifier/total, and creates a shared `RollResult`.

The injected RNG/time/ID options make correctness tests deterministic.

### `src/domain/random.ts`

Browser random-source implementations:

- `SecureRandomSource` uses Web Crypto and rejection sampling so bounded results do not introduce modulo bias;
- `SeededRandomSource` uses the documented xorshift32 deterministic sequence;
- `hashSeed` implements the shared UTF-8 FNV-1a 32-bit hash used for cross-runtime compatibility.

Seeded code must never be substituted for secure mode.

### `src/domain/history.ts`

Small pure history-filter boundary shared by UI, unit tests, and benchmarks. Centralizing query semantics prevents performance tests or components from drifting into slightly different filters.

### `src/domain/statistics.ts`

Pure observed-history statistics: count, mean, median, min/max, frequency distribution, percentages. It does not perform locale formatting or DOM rendering.

### `src/domain/probability.ts`

Exact interactive probability engine.

Two strategies:

- ordinary sums use dynamic programming;
- keep/drop expressions enumerate raw outcomes within a strict bound and reuse engine selection semantics.

It explicitly refuses calculations that exceed configured interactive complexity or safe-integer exactness and exposes stable `ProbabilityComplexityError` codes.

### `src/domain/probability-insights.ts`

Pure derived-statistics layer over an already validated exact `ProbabilityDistribution`. It computes:

- lower exact quantiles such as P25/P50/P75;
- median and all tied modes;
- weighted variance and standard deviation;
- exact, at-most, and at-least probabilities for a selected integer threshold.

It does not rebuild distributions or weaken the complexity/exactness guard from `probability.ts`.

### `src/domain/probability-comparison.ts`

Pure pairwise comparison of two independently generated exact distributions. It computes left-higher, tie, right-higher probability and expected-value delta using ordered distribution points rather than enumerating cross-product raw dice outcomes.

The result probabilities are normalized/clamped only for tiny floating-point artifacts after multiplying already exact probability masses.

### `src/domain/persistence.ts`

Runtime validators for data crossing persistence/backup boundaries. Validation checks far more than object shape: expression validity, canonical timestamps, die ranges/indices, selection kept count, modifier consistency, recomputed totals, random-mode/seed rules, and preset bounds.

Storage data is not trusted merely because TypeScript originally wrote it.

## Internationalization layer

### `src/i18n/en.ts`

English catalog and structural `MessageCatalog` contract. Contains static strings and typed functions for dynamic phrases. New user-facing migrated copy should be added here first as the reference structure.

### `src/i18n/hi.ts`

Reviewed Hindi catalog implementing the complete English catalog contract. Technical identifiers/dice syntax remain unchanged where translation would reduce correctness/clarity.

### `src/i18n/index.ts`

Supported-catalog registry and active locale state. Exposes catalog lookup, current locale, the live `messages` binding, and `setLocale()`.

### `src/i18n/format.ts`

Locale-sensitive presentation boundary. Explicitly maps product locale IDs to `Intl` locales and exposes integer/decimal/fixed-decimal/date-time/time formatting helpers.

Localized React surfaces should use these helpers rather than inheriting the host's unrelated default locale.

### `src/i18n/errors.ts`

Stable domain/backup error-code → active-catalog mapping. Known failures use their code/context; unknown/native failures return caller-provided safe localized fallback text.

## Service layer

### `src/services/runtime.ts`

Single production location for deciding whether the renderer is executing in Tauri. Repository policy prevents direct runtime-marker probing elsewhere.

### `src/services/roll-service.ts`

Runtime adapter for rolling.

- Builds effective deterministic seed as `<configured-seed>:<sequence>`.
- Tauri: dynamically imports core API and invokes static `roll_expression`.
- Browser: selects secure or seeded TypeScript random source and calls the pure engine.
- Adapts the native result into shared `RollResult` by adding ID, mode, effective seed, and timestamp.

### `src/services/storage.ts`

Versioned local-storage adapter and normalization boundary. Owns keys, collection bounds, built-in preset generation, custom-preset filtering, settings normalization, onboarding marker, clear operation, safe read/write fallbacks, and privacy-safe storage-failure diagnostics.

### `src/services/export.ts`

Serialization + backup + output boundary. Owns:

- history JSON;
- spreadsheet-safe CSV;
- schema-v1 backup creation;
- backup JSON encoding;
- strict backup parsing/validation/normalization;
- browser download implementation;
- native save command routing.

The frontend never supplies an arbitrary native output path.

### `src/services/preset-file.ts`

Versioned shareable preset-file boundary. It:

- exports only custom presets and omits built-in IDs/local IDs/creation timestamps;
- canonicalizes dice expressions through the parser;
- emits schema version `1` plus a canonical export timestamp;
- caps shared files at 1,000,000 UTF-8 bytes and 500 preset entries;
- checks `File.size` before reading oversized selected files;
- validates root kind/schema/timestamp/name/description/expression bounds;
- trims imported user text where appropriate before it reaches local preset materialization.

This is intentionally narrower than the full backup format: it is for sharing reusable roll setups, not cloning DiceLab application state.

### `src/services/logger.ts`

Local structured diagnostic logger. Normalizes event names, timestamps severity, recursively bounds context, truncates values, redacts sensitive key families, and serializes an `Error` only as its type—not raw message/stack.

No remote telemetry pipeline is required by this module.

## Styling/test environment

### `src/styles.css`

Global product styles, layout, component classes, responsive breakpoints, light/dark variables, focus/accessibility utilities, histogram/probability visuals, and motion rules driven by root data attributes.

Keep semantic state in components/root data attributes rather than encoding business decisions only in CSS.

### `src/test/setup.ts`

Shared Vitest/jsdom environment setup and browser-API shims required by component/integration tests. Changes here affect the whole frontend test suite and should represent browser capabilities, not hide product defects.

## Native Rust layer

### `src-tauri/src/main.rs`

Minimal executable entry point that calls the library's application runner. Keeping native implementation in `lib.rs` makes tests/fuzz hooks easier to access.

### `src-tauri/src/lib.rs`

Native trust boundary and Rust implementation. Major responsibilities:

- independent dice parsing/validation;
- keep/drop semantics;
- secure `OsRng` rolling;
- cross-runtime deterministic seed hashing/xorshift implementation;
- Tauri `roll_expression` command;
- Tauri `save_text_export` command;
- filename/format/payload/final-extension validation;
- OS save dialog invocation;
- safe filesystem write failure text;
- deterministic/native parser tests;
- generated/adversarial parser invariants;
- fuzz hook under the `fuzzing` feature.

Renderer-controlled input must be validated here even when the frontend already validates it.

### `src-tauri/build.rs`

Tauri build-script entry point. It delegates build-time integration to Tauri's build helper.

### `src-tauri/tauri.conf.json`

Desktop product/build/window/bundle/security configuration. Contains application version/identifier, frontend dev/build hooks, main-window dimensions, CSP, bundle metadata, and icon path.

### `src-tauri/capabilities/default.json`

Minimal main-window capability declaration. Broad filesystem/shell/network/process capability additions are intentionally blocked by repository policy scripts.

### `src-tauri/Cargo.toml`

Native crate manifest: package metadata, build dependency, runtime dependencies, Tauri features, fuzz feature gate, and crate library types.

### `src-tauri/Cargo.lock`

Generated reproducible Rust dependency graph. Never hand-edit transitive entries to make a stale graph appear current.

## Fuzz target

### `src-tauri/fuzz/Cargo.toml`

Separate cargo-fuzz package manifest. Keeps fuzz-only tooling/dependencies outside the normal application dependency surface.

### `src-tauri/fuzz/fuzz_targets/parser.rs`

Feeds arbitrary UTF-8 into the production parser invariant hook. Successful parses must normalize and reparse without changing core expression semantics.

### `src-tauri/fuzz/README.md`

Local/nightly setup, bounded command examples, artifact handling, and rule that actionable fuzz discoveries become deterministic regressions.

## Configuration files

### `vite.config.ts`

React/Vite build configuration including Tauri-compatible dev host/HMR behavior, ignored native source watching, permitted env prefixes, platform-specific browser target, debug minification/sourcemap behavior.

### `vitest.config.ts`

Vitest/jsdom configuration and test setup wiring.

### `eslint.config.js`

Flat ESLint configuration for the TypeScript/React source and repository environment.

### `tsconfig.json`

TypeScript solution/project-reference entry point.

### `tsconfig.app.json`

Frontend/application TypeScript compilation rules.

### `tsconfig.node.json`

Node/build-tool TypeScript rules (for Vite/config-side code).

### `.prettierrc.json`, `.editorconfig`, `.gitattributes`

Formatting/editor/line-ending repository consistency controls.

### `.env.example`

Safe environment-variable example/template. Real credentials must never be committed.

### `.gitignore`

Generated/dependency/build/local/fuzz artifact exclusions. If a generated artifact is intentionally versioned (for example lockfiles), it must remain explicitly tracked.

## Test naming map

DiceLab generally follows these suffix semantics:

- `*.test.ts` / `*.test.tsx` — deterministic unit/component tests;
- `*.integration.test.tsx` — cross-component/storage/application journey tests in jsdom;
- `*.bench.ts` — executable Vitest benchmark cases;
- `scripts/*.test.mjs` — dependency-free Node self-tests for repository tooling;
- `scripts/*.integration.test.mjs` — run an audit against actual committed repository state;
- `src-tauri/fuzz/fuzz_targets/*` — coverage-guided fuzz entry points;
- Rust `#[cfg(test)]` module inside `lib.rs` — native parser/RNG/export/invariant tests.

See [`testing.md`](testing.md) for the complete verification strategy and [`repository-file-reference.md`](repository-file-reference.md) for each exact test file's scope.

## Change routing cheat sheet

| Change | Primary implementation | Also review |
| --- | --- | --- |
| Dice syntax/bounds | `domain/parser.ts`, `src-tauri/src/lib.rs` | errors/i18n, persistence, probability, parity tests, fuzz, docs |
| Keep/drop semantics | `domain/engine.ts`, native Rust | probability enumeration, persistence total/kept validation, seeded tests |
| Randomness | `domain/random.ts`, native Rust, `roll-service.ts` | cross-runtime vectors, security docs, UI mode copy |
| Probability analysis | `domain/probability*.ts`, `ProbabilityPanel.tsx` | exactness/complexity limits, formatting, unit/component tests, performance/docs |
| Preset sharing | `services/preset-file.ts`, `App.tsx`, `RollWorkspace.tsx` | parser bounds, local preset limits, i18n, transfer tests, data contracts |
| Settings field | `domain/types.ts`, storage, Settings UI | backup normalization, defaults, tests, docs, possibly schema migration |
| Locale/copy | `i18n/en.ts`, `i18n/hi.ts` | formatter mapping, UI tests, review record, document lang/persistence |
| Export/backup | `services/export.ts` | Rust save command, security boundaries, tests, release smoke docs |
| Native command | focused service adapter + Rust | command/runtime/capability/CSP audits, ADR/security docs |
| Storage record | persistence/storage | backup compatibility, corruption recovery tests, privacy/logging |
| Release workflow | `.github/workflows/release.yml` | verifier, release docs, provenance/checksum rules, CODEOWNERS |
