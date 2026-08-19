# DiceLab Architecture

## Goals

DiceLab is a modular, offline-first desktop application with a web companion. The architecture prioritizes deterministic domain logic, secure native randomness, accessible UI, small trust boundaries, straightforward testing, and locale-ready presentation.

## High-level shape

```text
┌────────────────────────────────────────────────────────────┐
│ React UI + English message catalog                         │
│ components/ · i18n/ · config/                             │
├────────────────────────────────────────────────────────────┤
│ Application services                                      │
│ roll-service · storage · export/backup                     │
├────────────────────────────────────────────────────────────┤
│ TypeScript domain                                         │
│ parser · engine · random · persistence · probability · stats│
├──────────────────────┬─────────────────────────────────────┤
│ Browser companion    │ Tauri desktop                      │
│ Web Crypto           │ Rust command + OS secure RNG       │
│ localStorage         │ WebView localStorage               │
└──────────────────────┴─────────────────────────────────────┘
```

## Frontend boundaries

### `src/domain/`

Pure or mostly pure business rules live here:

- `parser.ts` validates and normalizes dice notation.
- `engine.ts` applies rolls, modifiers, and keep/drop selection.
- `random.ts` defines secure-browser and deterministic random sources.
- `persistence.ts` validates persisted roll/preset records independently of TypeScript compile-time trust.
- `probability.ts` computes exact common-expression distributions with explicit complexity and numeric-precision limits.
- `statistics.ts` summarizes observed history.
- `types.ts` defines shared domain contracts.

Domain code should not depend on React or browser persistence.

### `src/services/`

Application boundaries live here:

- `roll-service.ts` selects native Tauri or web execution.
- `storage.ts` owns versioned local-storage keys, validation, deduplication, bounds, and safe fallback behavior.
- `export.ts` owns CSV/JSON serialization plus strict backup validation/import.

Services may use browser APIs, but UI components should not duplicate their rules.

### `src/i18n/`

User-facing English copy is externalized from UI components:

- `en.ts` is the English catalog and defines the widened `MessageCatalog` shape for future locales.
- `index.ts` is the locale-selection boundary. English is the only shipped locale today.
- Dynamic UI phrases are catalog functions so plural/count-dependent text does not need to be reintroduced inline.
- Built-in preset names/descriptions are also catalog-backed.

Adding a locale must satisfy the same `MessageCatalog` contract before locale selection is exposed in Settings. No runtime translation dependency is required for the current single-locale release.

### `src/config/`

Stable product metadata such as version, project URLs, support contacts, and funding links is centralized so About/Settings surfaces do not drift independently.

### `src/components/`

Components own presentation and user interaction. They receive domain objects and callbacks rather than accessing storage directly. This keeps views easier to test and avoids hidden state transitions. User-facing copy should come from the message catalog rather than new inline literals.

## Native boundary

`src-tauri/src/lib.rs` exposes one product-specific Tauri command: `roll_expression`.

The command:

1. validates the expression again in Rust;
2. bounds dice count, sides, modifiers, and keep/drop counts;
3. selects OS-backed secure randomness or deterministic seeded randomness;
4. returns normalized dice values and totals;
5. leaves timestamps, persistence, and presentation to the frontend.

Validation exists on both sides intentionally. Frontend validation provides immediate UX; native validation protects the trust boundary.

## Randomness model

Secure mode and seeded mode are separate product concepts.

- **Secure desktop mode:** Rust uses `OsRng` from the `rand` ecosystem.
- **Secure web mode:** Web Crypto fills `Uint32Array` values with rejection sampling to avoid modulo bias.
- **Seeded web mode:** UTF-8 FNV-1a 32-bit hashing feeds a deterministic xorshift32 stream.
- **Seeded native mode:** Rust implements the same UTF-8 FNV-1a 32-bit hash, xorshift32 state transition, and bounded integer conversion.

The same effective seed and expression therefore reproduce the same deterministic values in web and desktop runtimes. TypeScript and Rust tests share fixed reference vectors to make algorithm drift a visible compatibility failure. Seeded mode is intentionally non-cryptographic and must never replace secure mode silently.

See ADR-0002 for the compatibility contract.

## Persistence

DiceLab currently needs no database. Small local records use namespaced, versioned local-storage keys:

- `dicelab.history.v1`
- `dicelab.presets.v1`
- `dicelab.settings.v1`
- `dicelab.onboarded.v1`

This is deliberate: a database would add migration and binary size complexity without improving current workflows. If storage requirements become relational or significantly larger, a future ADR must justify a database and migration plan.

Local storage is not treated as trusted merely because DiceLab wrote it earlier. History/presets are validated against domain invariants, bounded, and deduplicated on recovery. Invalid values degrade safely rather than crashing application startup.

## Backup schema

Backup schema version `1` contains:

- export timestamp;
- roll history;
- custom presets;
- settings.

Imports are bounded and strictly validated before replacing in-memory state. Validation includes expression/result consistency, die bounds/indices, canonical timestamps, deterministic-seed requirements, unique record IDs, and supported settings. Built-in presets are never trusted from the backup; the application re-adds its own built-ins.

Ordinary local-storage recovery can discard malformed/duplicate records. Backup import instead rejects ambiguous input so a user-supplied backup is never silently rewritten during restore.

## Error handling

User-controlled inputs are converted into bounded domain errors. The UI shows actionable messages and does not expose stack traces. Storage failures degrade to in-memory operation instead of blocking dice rolls.

## Security boundaries

- No shell plugin is granted.
- No broad filesystem plugin is granted.
- No remote application API is required.
- Tauri capabilities are limited to the required core surface for the main window.
- A restrictive CSP blocks arbitrary remote scripts/content.
- Backup and local-storage data are treated as untrusted input.
- CSV export neutralizes spreadsheet formula prefixes in user-controlled cells.
- Repository secrets and signing credentials must stay outside source control.

## Performance boundaries

Probability calculation has explicit interactive complexity limits and refuses raw-outcome counts that cannot retain exact safe-integer ways. Large history retention is capped at 5,000 entries. Rendering also limits the number of probability bars shown at once.

## Internationalization

English is the initial shipping language. The user-facing React surfaces and built-in preset copy are externalized through `src/i18n/`. The current locale boundary intentionally remains small: it provides compile-time catalog shape checking without a translation dependency or locale switch that would imply an unshipped translation.

A second locale can be added by creating a complete catalog with the same `MessageCatalog` shape, extending `SupportedLocale`, and then exposing locale selection/persistence. Domain/parser errors should migrate to stable error codes before those messages are translated so business rules remain locale-neutral.

## Architecture decisions

See [`docs/adr/`](adr/) for durable decisions and alternatives considered.
