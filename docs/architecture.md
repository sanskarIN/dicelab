# DiceLab Architecture

## Goals

DiceLab is a modular, offline-first desktop application with a web companion. The architecture prioritizes deterministic domain logic, secure native randomness, accessible UI, small trust boundaries, reviewed localization, privacy-safe diagnostics, reproducible release automation, and straightforward testing.

## High-level shape

```text
┌──────────────────────────────────────────────────────────────┐
│ React UI                                                     │
│ components/                                                  │
├──────────────────────────────────────────────────────────────┤
│ Product metadata + localization                             │
│ config/ · typed catalogs · locale-aware formatters          │
├──────────────────────────────────────────────────────────────┤
│ Application services                                        │
│ runtime · roll-service · storage · export/backup · logging  │
├──────────────────────────────────────────────────────────────┤
│ TypeScript domain                                           │
│ parser · engine · random · history · persistence · prob/stats│
├───────────────────────┬──────────────────────────────────────┤
│ Browser companion     │ Tauri desktop                       │
│ Web Crypto            │ Rust commands + OS secure RNG       │
│ Blob downloads        │ native system save dialog           │
│ localStorage          │ WebView localStorage                │
└───────────────────────┴──────────────────────────────────────┘

Repository verification outside the runtime:
  scripts/ → docs/secret/version audits, CDP browser E2E, benchmarks
  src-tauri/fuzz/ → coverage-guided native parser fuzzing
  .github/ → CI, fuzzing, CodeQL, dependency updates, release packaging
```

## Frontend boundaries

### `src/config/`

Stable product metadata lives here so version, repository, privacy, funding, support, and contact URLs are reused by multiple UI surfaces rather than copied independently.

`APP_VERSION` participates in the automated version-sync audit with npm, Cargo, and Tauri metadata.

### `src/domain/`

Pure or mostly pure business rules live here:

- `parser.ts` validates and normalizes dice notation and exposes stable parser error codes plus bounded context.
- `engine.ts` applies rolls, modifiers, and keep/drop selection.
- `random.ts` defines secure-browser and deterministic random sources.
- `history.ts` owns expression/total filtering so UI/tests/benchmarks share one query implementation.
- `persistence.ts` validates untrusted persisted roll/preset records and canonical timestamps.
- `probability.ts` computes exact common-expression distributions with explicit complexity/numeric limits and stable error codes.
- `statistics.ts` summarizes observed history.
- `types.ts` defines shared domain contracts, including the persisted locale preference.

Domain code should not depend on React or browser persistence.

### `src/i18n/`

User-facing copy, locale state, locale-aware presentation formatting, and error translation live here:

- `en.ts` is the English catalog and structural source for catalog compatibility.
- `hi.ts` is the reviewed Hindi catalog.
- `index.ts` owns supported-locale resolution, active locale state, and the live catalog binding.
- `format.ts` maps DiceLab locale IDs to explicit `Intl` locales and centralizes number/date/time formatting.
- `errors.ts` maps stable parser/probability/backup error codes into the active catalog.

React surfaces should not parse English exception prose to decide what a failure means. Known validation failures are categorized by code; unknown/native failures use a safe localized fallback.

The selected locale controls both UI copy and application-generated presentation formatting. Machine-readable exports, persisted ISO timestamps, expressions, and identifiers remain locale-neutral.

### `src/services/`

Application boundaries live here:

- `runtime.ts` detects the Tauri/native boundary used by service adapters.
- `roll-service.ts` selects native Tauri or web rolling execution.
- `storage.ts` owns versioned local-storage keys, validation/normalization, bounded retention, localized built-ins, and safe fallback behavior.
- `export.ts` owns CSV/JSON serialization, backup validation/import, browser download fallback, and native save-command routing.
- `logger.ts` owns structured local diagnostic events, sensitive-key redaction, depth/size bounds, and omission of raw error messages/stacks.

Services may use browser APIs, but UI components should not duplicate their rules.

### `src/components/`

Components own presentation and user interaction. They receive domain objects and callbacks rather than accessing storage directly. This keeps views easier to test and avoids hidden state transitions.

The root `AppErrorBoundary` is a last-resort UI recovery layer. Expected validation/storage/export operations remain handled closer to their source; the boundary does not replace normal error handling.

## Native boundary

`src-tauri/src/lib.rs` currently exposes two product-specific Tauri commands:

- `roll_expression`
- `save_text_export`

### Native rolling

`roll_expression`:

1. validates the expression again in Rust;
2. bounds dice count, sides, modifiers, and keep/drop counts;
3. selects OS-backed secure randomness or the shared deterministic seeded algorithm;
4. returns normalized dice values and totals;
5. leaves timestamps, persistence, localization, and presentation to the frontend.

Validation exists on both sides intentionally. Frontend validation provides immediate UX; native validation protects the trust boundary.

### Native text exports

`save_text_export` is deliberately narrower than a general filesystem API.

The frontend supplies only:

- a bounded suggested filename;
- bounded text contents;
- an allowlisted `csv` or `json` format.

The frontend does not supply an arbitrary destination path. Rust opens the system save dialog, obtains the selected destination from the dialog, revalidates the final extension, and writes only to that selected path.

Cancellation returns a normal false result. Native save failures are presented through generic localized UI messages; the private selected path is not included in frontend error text.

This design allows useful native saves without granting the webview broad filesystem-write capability. See [`native-exports.md`](native-exports.md).

## Native parser verification

Native deterministic tests include:

- fixed seeded/hash compatibility vectors;
- generated normalization invariants;
- adversarial malformed-input parser corpus;
- native export request/path validation.

Coverage-guided parser fuzzing is separate from the normal deterministic suite under `src-tauri/fuzz/`. The parent crate exposes a parser invariant hook only when the `fuzzing` feature is enabled.

`.github/workflows/fuzz.yml` provides manual and scheduled bounded fuzz execution. Workflow configuration does not count as release evidence until a campaign is observed green on the intended candidate.

## Randomness model

Secure mode and seeded mode are separate product concepts.

- **Secure desktop mode:** Rust uses `OsRng` from the `rand` ecosystem.
- **Secure web mode:** Web Crypto fills `Uint32Array` values with rejection sampling to avoid modulo bias.
- **Seeded web/desktop mode:** both runtimes use the same UTF-8 FNV-1a 32-bit hash and xorshift32 state transition/bounded conversion.

The configured user seed is combined with a local sequence number before deterministic generation. Fixed TypeScript/Rust reference vectors protect cross-runtime compatibility.

Seeded mode is not cryptographically secure and must never silently replace secure mode.

## Persistence

DiceLab currently needs no database. Small local records use namespaced, versioned local-storage keys:

- `dicelab.history.v1`
- `dicelab.presets.v1`
- `dicelab.settings.v1`
- `dicelab.onboarded.v1`

Values read from local storage are treated as untrusted runtime input rather than trusted simply because TypeScript wrote them earlier.

Recovery behavior:

- malformed JSON falls back safely;
- settings are normalized to supported enums/bounds, including the reviewed locale allowlist;
- reduced motion overrides contradictory animation state;
- roll/preset records are domain validated;
- duplicate IDs are discarded from ordinary persisted collections;
- forged reserved built-in preset IDs are ignored;
- history/preset collection sizes remain bounded;
- storage read/write/clear failures degrade without blocking core rolling and emit only privacy-safe structured operational events.

Built-in preset names/descriptions are regenerated from the active catalog. User-created preset copy remains unchanged across locale switches.

A database would add migration/binary-size complexity without improving current workflows. If storage requirements become relational or significantly larger, a future ADR must justify a database and migration plan.

## Backup schema

Backup schema version `1` contains:

- export timestamp;
- roll history;
- custom presets;
- settings, including the supported locale preference.

Imports are bounded and validated before replacing in-memory state. Built-in presets are never trusted from the backup; the application re-adds its own localized built-ins.

Explicit backup import is intentionally stricter than ordinary local-storage recovery. Duplicate/ambiguous or structurally inconsistent supplied records reject the import instead of being silently discarded.

Schema-v1 backups produced before locale persistence remain compatible: missing or unsupported locale values normalize safely to English.

Backup validation errors expose stable codes and bounded numeric context to the localization layer. Schema changes that cannot preserve safe compatibility require a new schema version and migration documentation.

## Error model

Expected failures are categorized near their source:

- `DiceExpressionError` — parser validation codes;
- `ProbabilityComplexityError` — interactive exactness/complexity codes;
- `BackupValidationError` — explicit restore trust-boundary codes.

Each category provides stable machine-readable code plus bounded context. Developer-oriented exception messages may remain for diagnostics, but presentation behavior uses code/context.

Unknown/native failures use a localized generic fallback. The root error boundary handles unexpected render errors with a reload action and preserves local data.

Export UI also catches native/browser save failures and emits only safe localized status text rather than arbitrary thrown details.

## Logging and diagnostics

DiceLab does not require remote telemetry.

`src/services/logger.ts` emits local structured console records containing:

- ISO timestamp;
- level;
- normalized stable event name;
- optional bounded/redacted context.

Sensitive key families—credentials, seeds, email/name, expressions/content/history/presets/backups/files/payloads/messages/stacks—are redacted. Raw `Error.message` and `Error.stack` are not serialized.

Normal valid rolls and user-correctable validation failures are not logged by default. See [`logging.md`](logging.md).

## History performance model

Retention remains capped at 5,000 rolls. Domain filtering and statistics operate on the full bounded collection, while the UI initially mounts only 200 matching rows and reveals more in 200-row increments.

This keeps export/statistics semantics complete without creating thousands of DOM nodes immediately. `src/domain/history.ts` is benchmarked and unit-tested independently of React.

## Browser end-to-end boundary

`scripts/e2e-browser.mjs` tests the **production** web bundle through an actual Chromium-compatible browser using the DevTools protocol.

It intentionally avoids a new Playwright/Puppeteer dependency for the current smoke scope. `scripts/cdp-session.mjs` isolates the protocol transport and has dependency-free Node tests.

The E2E journey covers onboarding, rolling/history, browser downloads, reload persistence, command-palette keyboard behavior, probability, clear-data, real file input, and backup restoration. CI/tagged release web verification run it after `npm run build`.

The browser E2E validates the browser download path. Native system-dialog export behavior is verified separately on packaged desktop candidates because a browser test cannot prove the Tauri command/dialog/filesystem boundary.

The runner checks browser navigation errors explicitly and does not count a browser/network policy error as an application pass. See [`e2e.md`](e2e.md).

## Repository verification boundaries

Dependency-free Node scripts protect repository/release invariants before package installation:

- `check-secrets.mjs` — high-confidence committed credential/private-key patterns without printing matched values;
- `check-version-sync.mjs` — npm/frontend/Cargo/Tauri version agreement and optional release-tag agreement;
- `cdp-session.test.mjs` + E2E syntax check — browser-automation infrastructure sanity.

After locked dependency installation:

- Markdown link audit;
- Prettier/ESLint;
- Vitest unit/integration suites;
- TypeScript/Vite production build;
- real-browser E2E;
- Rust format/test/Clippy;
- separate CodeQL analysis.

`Cargo.toml` changes require a regenerated committed `Cargo.lock`; configured automation is not evidence that the new graph has landed. Locked Rust checks are the release verification boundary.

## Release boundary

A `v*` tag triggers cross-platform packaging only after version/tag agreement and web/native quality prerequisites.

Successful workflow artifacts are packaged into ZIP files. The draft-release job generates:

- `RELEASE-METADATA.json` — repository, tag, source commit, workflow run ID/attempt;
- `SHA256SUMS.txt` — hashes for artifact ZIPs and provenance metadata.

The release remains a draft until maintainers verify checksums, install/smoke-test supported desktop artifacts, verify native saves and localization, review signing status, and capture real candidate screenshots.

## Security boundaries

- No shell plugin is granted.
- No broad filesystem plugin is granted to the webview.
- Native text writes are limited to the purpose-built export command and operating-system-dialog-selected destination.
- No remote application API is required.
- Tauri capabilities remain intentionally narrow for the main window.
- A restrictive CSP blocks arbitrary remote scripts/content.
- Local persistence and backup data are treated as untrusted input.
- CSV output neutralizes common spreadsheet formula prefixes.
- Structured diagnostics redact sensitive/user-content key families.
- Repository secrets and signing credentials must stay outside source control.
- CI and release verification run a self-tested high-confidence repository secret audit.

## Internationalization

DiceLab currently ships reviewed English and Hindi catalogs. English remains the default.

User-facing React/preset strings are stored in typed catalogs, including dynamic message functions where word order may differ between locales. Parser/probability/backup presentation errors resolve from stable error codes rather than English exception text.

`src/i18n/format.ts` explicitly maps supported DiceLab locales to `Intl` locales so application-generated number/date/time presentation follows the selected UI language instead of independently inheriting the host browser locale.

The supported locale preference persists locally, survives compatible backups, updates document language metadata, and controls localized built-in preset copy. User-created content remains unchanged.

A future locale must satisfy the widened `MessageCatalog`, extend the locale preference and formatter mapping, pass persistence/backup/interface/formatting regression coverage, and receive a locale-specific human review before Settings exposes it. See [`localization.md`](localization.md).

## Performance and benchmarks

Probability calculation has explicit interactive complexity/numeric-exactness limits. History retention is capped at 5,000 entries and UI row rendering is progressive.

`npm run bench` measures parser, browser seeded/secure RNG generation, probability, 5,000-roll history filtering, and 5,000-roll statistics using the existing locked Vitest toolchain.

Wall-clock benchmark output is release evidence rather than a deterministic CI threshold; machine/runtime metadata must accompany recorded numbers.

## Architecture decisions

See [`docs/adr/`](adr/) for durable decisions and alternatives considered.
