# DiceLab Application Flows

This document explains how user actions travel through React, domain logic, browser/native adapters, persistence, localization, and validation. It complements [`architecture.md`](architecture.md), which describes module boundaries, and [`data-contracts.md`](data-contracts.md), which describes the shapes that cross those boundaries.

## 1. Application startup

### Entry point

`src/main.tsx` mounts the React application inside the root error boundary. `src/App.tsx` then becomes the application coordinator.

### Initial state loading

`App` initializes independent pieces of state from local persistence:

1. `loadHistory()` reads and validates retained roll records.
2. `loadSettings()` normalizes theme, locale, motion, randomness, seed, and history-limit values.
3. The active message catalog is set immediately from the loaded locale before normal application rendering continues.
4. `loadPresets(settings.locale)` rebuilds localized built-in presets and appends validated user-created presets.
5. `hasCompletedOnboarding()` determines whether the onboarding dialog should be shown.
6. The initial navigation view is `roll` and the initial expression is `1d20`.

If local storage is blocked/corrupted, storage services return safe defaults and emit only bounded privacy-safe operational diagnostics. Startup does not require a network service or account.

### Startup side effects

After state exists:

- settings and bounded history are persisted whenever either changes;
- custom presets are persisted whenever the preset collection changes;
- root HTML data attributes are updated for theme, reduced motion, and animation state;
- the document `lang` attribute follows the selected DiceLab locale;
- system-theme changes are observed when theme preference is `system`;
- a global `Ctrl/Cmd + K` handler toggles the command palette;
- Escape closes the command palette.

## 2. Navigation and shell flow

`AppShell` owns the persistent application frame and navigation affordances. `App` owns the current `AppView` state.

Supported views are rendered conditionally:

- Roll → `RollWorkspace`
- History → `HistoryPanel`
- Probability → `ProbabilityPanel`
- Settings → `SettingsPanel`
- About → `AboutPanel`

The command palette receives the same navigation setter, so keyboard navigation and visible navigation update the same application state rather than maintaining parallel routers.

## 3. Roll flow

### Input

The user enters dice notation in `RollWorkspace`. Examples include:

- `1d20`
- `2d6+3`
- `4d6kh3`
- `2d20kl1`

`RollWorkspace` performs immediate parser validation for UI feedback. Submitting a roll calls the coordinator's asynchronous `roll()` function.

### Coordinator validation

Before selecting a runtime, `App.roll()` parses the expression again. This prevents an invalid expression from reaching a service simply because UI validation was bypassed.

### Runtime adapter

`src/services/roll-service.ts` chooses the execution path:

- **Tauri desktop** → invoke native `roll_expression`.
- **Normal browser** → use the TypeScript engine/random source.

Runtime detection belongs to `src/services/runtime.ts` so production components do not probe Tauri internals directly.

### Secure randomness

- Desktop secure mode uses Rust `OsRng`.
- Browser secure mode uses Web Crypto with bounded integer generation designed to avoid modulo bias.

### Seeded randomness

The user seed is combined with an in-memory sequence counter so successive rolls are deterministic but not identical. Web and desktop implementations use compatible seeded hashing/state rules guarded by fixed cross-runtime reference vectors.

The sequence counter:

- starts at zero when the app mounts;
- increments for each roll request;
- resets after backup restore;
- resets after clearing all local data.

It is not persisted as durable user data.

### Result creation

A `RollResult` contains:

- unique ID;
- normalized expression;
- final total;
- every die value with kept/dropped state and stable index;
- modifier;
- random mode;
- effective seed for deterministic rolls;
- ISO timestamp.

After a successful roll, the result is prepended to history and history is immediately bounded to the configured retention limit.

### Failure handling

Expected parser/domain failures are converted through the stable error-code localization layer. Unknown/native failures use a generic localized fallback. Raw exception prose is not the presentation contract.

The `busy` flag prevents overlapping coordinator roll requests from the same action surface.

## 4. Keep/drop selection flow

The parser converts `kh`, `kl`, `dh`, and `dl` syntax into a typed `DiceSelection`.

The engine rolls all dice first, then applies selection semantics using deterministic index tie-breaking when values are equal. Each die retains its original index and a `kept` boolean so presentation/export/statistics can distinguish selected and dropped values without reconstructing the selection later.

The native Rust implementation independently validates and applies the same conceptual rules rather than trusting renderer-parsed structures.

## 5. Preset flow

### Built-in presets

Built-ins are not trusted from persistence. `getBuiltinPresets(locale)` regenerates them from the active catalog every time they are loaded/relocalized.

Built-in IDs use the reserved `builtin-` prefix. Examples include the d20 check, advantage/disadvantage, ability roll, fireball dice, and percentile die.

### User-created presets

Saving a preset:

1. parses the current expression;
2. creates an ID using `crypto.randomUUID()` when available, otherwise a timestamp-based fallback;
3. stores the normalized expression;
4. stores the user-supplied name exactly;
5. uses the current catalog's generic custom-preset description at creation time;
6. stores an ISO creation timestamp.

Deletion refuses IDs beginning with `builtin-`.

Persistence removes forged/reserved built-in IDs from user storage and caps custom presets at 500.

### Locale switching

When locale changes, `App.updateSettings()` rebuilds only built-in presets from the new catalog and preserves every non-built-in preset object. User-created names/descriptions are therefore not silently translated or rewritten.

## 6. History flow

History is stored newest-first and bounded by the active history limit (minimum 10, maximum 5,000).

`HistoryPanel`:

- filters via `src/domain/history.ts`;
- computes statistics over the full filtered set;
- renders only an initial 200 records;
- reveals additional records in 200-record windows;
- renders an observed-total histogram;
- exports the full filtered set, not only the visible window.

Changing the search query resets the visible window so stale pagination state does not hide the beginning of a new result set.

Clearing history from the History view clears only roll history. Clearing all data from Settings resets history, presets, settings, onboarding state, locale, sequence state, and current view.

## 7. Statistics flow

`src/domain/statistics.ts` receives roll records and derives:

- count;
- mean;
- median;
- minimum/maximum;
- total-frequency distribution;
- percentages.

Statistics are domain-level calculations and are independent of React. The UI formats values with `src/i18n/format.ts` so display conventions follow the selected DiceLab locale.

## 8. Probability flow

`ProbabilityPanel` is intentionally independent of roll history. It parses an expression and calls `calculateProbability()`.

The probability domain supports exact common-expression distributions within explicit safety/performance budgets. It rejects cases that would exceed the interactive complexity limit or JavaScript safe-integer exactness guarantees.

Returned `ProbabilityDistribution` includes:

- normalized expression;
- probability points (`total`, `probability`, `ways`);
- expected value;
- minimum/maximum;
- exactness flag;
- total raw outcomes.

The UI limits the number of mounted distribution rows for responsiveness while retaining the calculated distribution object.

Expected probability failures are mapped from stable error codes into the active catalog.

## 9. Locale flow

### Active locale

Supported locale IDs are currently:

- `en`
- `hi`

`src/i18n/index.ts` owns the active catalog binding. `src/i18n/format.ts` maps those product locale IDs to explicit `Intl` locales:

- `en` → `en-US`
- `hi` → `hi-IN`

### Change flow

When the language selector changes:

1. Settings emits the next settings object.
2. `App.updateSettings()` calls `setLocale()` before replacing settings state.
3. Built-in presets are regenerated from the next catalog.
4. User presets are preserved.
5. React rerenders catalog-backed copy.
6. the theme/metadata effect updates document `lang`.
7. settings are persisted.

### Locale-neutral data

Localization changes presentation, not machine data. The following remain locale-neutral:

- dice expressions;
- IDs;
- persisted/exported ISO timestamps;
- seed text;
- CSV/JSON field names and numeric serialization;
- user-created text;
- error codes.

## 10. Theme and motion flow

Theme preference is `system`, `light`, or `dark`.

`App` applies the resolved theme to `document.documentElement.dataset.theme`.

Reduced motion has precedence over animation preference. Both storage and backup normalization enforce that contradictory imported/persisted state cannot produce `reducedMotion: true` together with active animations.

CSS consumes the root data attributes rather than components implementing independent animation policy.

## 11. History export flow

### Serialization

`historyToCsv()` creates a fixed-column CSV containing:

- ID;
- timestamp;
- expression;
- total;
- modifier;
- mode;
- seed;
- flattened dice values/kept state.

CSV cells beginning with common spreadsheet-formula prefixes (`=`, `+`, `-`, `@`) are neutralized before quoting/escaping.

`historyToJson()` emits pretty-printed JSON plus a trailing newline.

### Browser save

`saveTextExport()` detects a normal browser and calls `downloadText()`:

1. create UTF-8 Blob;
2. create object URL;
3. create temporary anchor with `download` filename;
4. click it;
5. remove anchor;
6. revoke object URL.

### Desktop save

Inside Tauri, `saveTextExport()` dynamically imports Tauri core and invokes `save_text_export` using a static command name.

Rust validates:

- filename presence/length/characters/path separators;
- requested `csv`/`json` format;
- filename extension;
- payload size (maximum 6,000,000 bytes);
- final path extension selected by the user.

The renderer never supplies the destination filesystem path. Rust obtains it from the OS save dialog and writes only there.

Dialog cancellation returns `false`. Save failure is surfaced by React as safe generic localized status, not raw path/OS text.

## 12. Backup export flow

`createBackup()` builds schema version 1 from:

- current history;
- custom presets only (built-ins are excluded);
- current settings;
- current ISO export timestamp.

`backupToJson()` pretty-prints the object. The same browser/native `saveTextExport()` boundary is used for output.

## 13. Backup import flow

`SettingsPanel` reads a user-selected file and passes it to `App.importBackup()`.

The coordinator obtains file text and passes it to `parseBackupJson()`.

Validation includes:

- maximum 5 MB input size;
- valid JSON/object root;
- schema version 1;
- history array and maximum 5,000 entries;
- preset array and maximum 500 entries;
- valid persisted roll records;
- valid persisted preset records;
- no duplicate roll IDs;
- no duplicate preset IDs;
- canonical export timestamp when supplied;
- valid theme;
- valid random mode;
- bounded/normalized history limit;
- bounded seed;
- supported locale fallback;
- reduced-motion/animation normalization;
- filtering of any reserved built-in preset IDs.

After validation succeeds:

1. active locale switches to the backup locale;
2. history is truncated to the restored history limit;
3. built-in presets are regenerated for that locale;
4. restored custom presets are appended;
5. settings replace current settings;
6. seeded sequence counter resets.

React effects then persist the restored state through normal storage functions.

## 14. Local-storage flow

Versioned keys:

- `dicelab.history.v1`
- `dicelab.presets.v1`
- `dicelab.settings.v1`
- `dicelab.onboarded.v1`

Storage reads are treated as untrusted even though DiceLab originally wrote them.

Recovery rules include:

- malformed JSON → fallback;
- invalid records → discarded from ordinary persisted collections;
- duplicate IDs → de-duplicated;
- forged built-in preset IDs → discarded from custom storage;
- excessive collections → bounded;
- unsupported settings → normalized to safe defaults;
- blocked read/write/clear → application continues with safe state and privacy-safe diagnostic events.

Explicit backup import is stricter than local-storage recovery: ambiguous/invalid supplied backup data is rejected instead of silently repaired when that could hide corruption.

## 15. Clear-all-data flow

Settings uses a confirmation interaction before invoking `clearAllData()`.

The coordinator then:

1. removes all DiceLab versioned local-storage keys;
2. switches active catalog back to default English;
3. clears history;
4. rebuilds default English built-in presets;
5. resets settings to `DEFAULT_SETTINGS`;
6. resets seeded sequence state;
7. reopens onboarding;
8. returns navigation to Roll.

The normal effects then persist the new default in-memory state as appropriate.

## 16. Onboarding flow

Onboarding visibility is derived from the versioned onboarding key. Completing onboarding writes `true` locally and closes the dialog.

If storage is unavailable, onboarding completion may not persist, but core rolling remains usable.

Onboarding copy follows the locale loaded before the first render, so a persisted Hindi preference applies to the first-run dialog as well.

## 17. Command palette flow

`Ctrl/Cmd + K` toggles the command palette globally. Escape closes it.

The palette can:

- navigate to application views;
- set useful dice expressions.

Its component tests protect modal focus trapping and focus restoration. The production browser E2E also covers keyboard opening/dismissal.

## 18. Unexpected render failure flow

`AppErrorBoundary` is the final React render-recovery boundary.

It:

- catches unexpected descendant rendering errors;
- logs only a fixed structured operational event through the privacy-safe logger;
- renders localized recovery UI;
- offers reload rather than clearing local user data.

Expected parser, import, export, storage, and native-operation failures should still be handled closer to their source and should not depend on the root error boundary.

## 19. Logging flow

DiceLab has no required remote telemetry pipeline.

`src/services/logger.ts` writes structured local console events with:

- timestamp;
- severity;
- stable normalized event name;
- optional recursively redacted/bounded context.

Sensitive key families such as credentials, seeds, user content, backup payloads, names/emails, raw messages, and stacks are redacted/omitted.

Normal valid rolls and ordinary user-correctable parser errors are not intended as operational incidents.

## 20. Release verification flow

Code/configuration reaching `main` is not automatically a release candidate.

Release preparation adds progressively stronger evidence:

1. dependency-free repository/security/policy audits;
2. locked dependency installation/checks;
3. formatting/lint/unit/integration/build checks;
4. production real-browser E2E;
5. Rust format/test/Clippy;
6. parser fuzz campaign;
7. benchmark evidence with machine/runtime metadata;
8. Windows/macOS/Linux packaging;
9. native export/localization/accessibility manual smoke;
10. checksum/provenance inspection;
11. signing/notarization status review;
12. real candidate screenshots;
13. human review of the draft release.

Use [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md) to record that evidence. Configured workflows alone do not complete evidence-gated roadmap items.
