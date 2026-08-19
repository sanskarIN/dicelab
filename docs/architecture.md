# DiceLab Architecture

## Goals

DiceLab is a modular, offline-first desktop application with a web companion. The architecture prioritizes deterministic domain logic, secure native randomness, accessible UI, small trust boundaries, and straightforward testing.

## High-level shape

```text
┌────────────────────────────────────────────────────────────┐
│ React UI + English locale catalog                         │
│ components/ · i18n/                                      │
├────────────────────────────────────────────────────────────┤
│ Application services                                      │
│ roll-service · storage · export/backup · logger           │
├────────────────────────────────────────────────────────────┤
│ TypeScript domain                                         │
│ parser · engine · random abstractions · probability · stats│
├──────────────────────┬─────────────────────────────────────┤
│ Browser companion    │ Tauri desktop                      │
│ Web Crypto           │ Rust command + OS secure RNG       │
│ localStorage         │ WebView localStorage               │
└──────────────────────┴─────────────────────────────────────┘
```

## Frontend boundaries

### `src/domain/`

Pure or mostly pure business rules live here:

- `parser.ts` validates and normalizes dice notation and publishes the shared public limits.
- `engine.ts` applies rolls, modifiers, and keep/drop selection.
- `random.ts` defines secure-browser and deterministic random sources.
- `probability.ts` computes exact common-expression distributions with explicit complexity limits.
- `statistics.ts` summarizes observed history.
- `types.ts` defines shared domain contracts.

Domain code should not depend on React or browser persistence.

### `src/services/`

Application boundaries live here:

- `roll-service.ts` selects native Tauri or web execution and maps stable native error codes to localized product messages.
- `storage.ts` owns versioned local-storage keys, validates persisted state, and provides safe fallback behavior.
- `export.ts` owns CSV/JSON serialization, shared persisted-data validation, and backup validation/import.
- `logger.ts` emits small structured development/runtime events while redacting sensitive-key values and never logging exception messages.

Services may use browser APIs, but UI components should not duplicate their rules.

### `src/components/`

Components own presentation and user interaction. They receive domain objects and callbacks rather than accessing storage directly. This keeps views easier to test and avoids hidden state transitions.

### `src/i18n/`

English is the initial shipping locale. User-facing TypeScript copy and validation messages live in the externalized English catalog rather than being duplicated across components. The active locale facade intentionally stays small so another reviewed locale can be introduced without rewriting product logic.

Export field names, filenames, source-code diagnostics, and other machine/developer contracts remain stable rather than being translated as UI copy.

## Native boundary

`src-tauri/src/lib.rs` exposes one product-specific Tauri command: `roll_expression`.

The command:

1. validates the expression again in Rust;
2. bounds dice count, sides, modifiers, and keep/drop counts;
3. selects OS-backed secure randomness or deterministic seeded randomness;
4. returns normalized dice values and totals;
5. returns stable machine-readable error codes rather than English UI copy;
6. leaves timestamps, persistence, localization, and presentation to the frontend.

Validation exists on both sides intentionally. Frontend validation provides immediate UX; native validation protects the trust boundary.

## Randomness model

Secure mode and seeded mode are separate product concepts.

- **Secure desktop mode:** Rust uses `OsRng` from the `rand` ecosystem.
- **Secure web mode:** Web Crypto fills `Uint32Array` values with rejection sampling to avoid modulo bias.
- **Seeded web mode:** a deterministic xorshift32 stream is used only for reproducibility.
- **Seeded native mode:** a deterministic `StdRng` is initialized from a stable FNV-derived seed.

The seeded algorithms do not need to produce identical cross-language sequences. Reproducibility is guaranteed within the selected runtime for the same effective seed.

## Persistence

DiceLab currently needs no database. Small local records use namespaced, versioned local-storage keys:

- `dicelab.history.v1`
- `dicelab.presets.v1`
- `dicelab.settings.v1`
- `dicelab.onboarded.v1`

Loaded history and custom presets are validated using the same integrity rules used by backup import. Persisted settings are normalized to safe supported values and bounded sizes. Invalid/corrupted entries are discarded instead of being trusted as application state.

This is deliberate: a database would add migration and binary size complexity without improving current workflows. If storage requirements become relational or significantly larger, a future ADR must justify a database and migration plan.

## Backup schema

Backup schema version `1` contains:

- export timestamp;
- roll history;
- custom presets;
- settings.

Imports are bounded and validated before replacing in-memory state. Validation checks expression normalization, dice ranges/indices, keep/drop flags, totals, dates, setting values, seed lengths, and collection limits. Built-in presets are never trusted from the backup; the application re-adds its own built-ins.

## Error handling

User-controlled inputs are converted into bounded domain errors. The UI shows actionable catalog-backed messages and does not expose stack traces. Native errors cross the Tauri boundary as stable codes and are translated in the TypeScript service layer. Storage failures degrade to in-memory operation instead of blocking dice rolls.

## Logging

DiceLab does not require a remote telemetry service. Structured logs are local console diagnostics intended for development/support troubleshooting. Event names are normalized, values are length-bounded, sensitive context keys are redacted, and exception messages are intentionally omitted because they can contain user-controlled text.

## Security boundaries

- No shell plugin is granted.
- No broad filesystem plugin is granted.
- No remote application API is required.
- Tauri capabilities are limited to `core:default` for the main window.
- A restrictive CSP blocks arbitrary remote scripts/content.
- Backup and persisted local data are treated as untrusted input.
- CSV seed cells that begin with spreadsheet formula prefixes are neutralized before export.
- Repository secrets and signing credentials must stay outside source control.

## Performance boundaries

Probability calculation has explicit interactive complexity limits. Large history retention is capped at 5,000 entries. Rendering also limits the number of probability bars shown at once.

## Internationalization

English is the initial shipping language and the TypeScript product copy is externalized under `src/i18n/`. Native user-facing errors use stable codes so Rust does not own locale text. A second language should be added only with a reviewed translation and locale-aware formatting audit.

## Architecture decisions

See [`docs/adr/`](adr/) for durable decisions and alternatives considered.
