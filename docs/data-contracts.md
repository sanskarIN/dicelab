# DiceLab Data and Boundary Contracts

This document records the shapes, limits, invariants, and compatibility rules that cross DiceLab module/runtime boundaries. These contracts are more stable than component layout and should be reviewed whenever persistence, backup, localization, native commands, or deterministic behavior changes.

## 1. Core dice expression contract

### `DiceExpression`

Defined in `src/domain/types.ts`:

```ts
interface DiceExpression {
  count: number;
  sides: number;
  modifier: number;
  selection?: DiceSelection;
  normalized: string;
}
```

Supported selection kinds:

```text
keep-highest
keep-lowest
drop-highest
drop-lowest
```

Text syntax uses:

```text
kh
kl
dh
dl
```

Examples:

```text
1d20
2d6+3
4d6kh3
2d20kl1
4d6dl1-2
```

### Parser bounds

The TypeScript and native parser boundaries enforce the same product-scale limits:

| Value | Limit |
| --- | --- |
| Dice count | 1–1,000 |
| Sides per die | 2–1,000,000 |
| Absolute modifier | ≤ 1,000,000,000 |
| Keep count | ≥ 1 and ≤ dice count |
| Drop count | ≥ 1 and must leave at least one die |

Normalization removes irrelevant whitespace, makes the leading count explicit, canonicalizes keep/drop notation, and emits a compact signed modifier.

Examples:

```text
d20          -> 1d20
2D6 + 3      -> 2d6+3
4d6KH3       -> 4d6kh3
```

## 2. Parser error contract

`DiceExpressionError` contains a stable code plus immutable bounded context.

Current codes:

| Code | Meaning |
| --- | --- |
| `invalid-format` | Input does not match supported dice notation |
| `dice-count-out-of-range` | Dice count is not an allowed safe integer |
| `side-count-out-of-range` | Side count is outside product bounds |
| `modifier-out-of-range` | Modifier exceeds the supported magnitude |
| `selection-count-too-small` | Keep/drop count is below 1 |
| `keep-count-exceeds-dice` | Requested keep count exceeds dice count |
| `drop-count-removes-all` | Drop selection would leave no kept die |

Context may contain `min` and/or `max` numeric values.

React presentation should map the code/context through `src/i18n/errors.ts`; it should not parse the developer-oriented English exception message.

## 3. Die result contract

```ts
interface DieRoll {
  value: number;
  kept: boolean;
  index: number;
}
```

Invariants:

- `value` is an integer from 1 through expression side count;
- `index` is a unique integer from 0 through `count - 1`;
- every original die has a record, including dropped dice;
- `kept` identifies whether the die contributes to the total;
- stable original indices are used as tie-breakers for deterministic keep/drop semantics.

## 4. Roll result contract

```ts
interface RollResult {
  id: string;
  expression: string;
  total: number;
  dice: DieRoll[];
  modifier: number;
  mode: 'secure' | 'seeded';
  seed?: string;
  rolledAt: string;
}
```

Persistence validation additionally requires:

- ID length 1–200;
- expression parses successfully;
- persisted modifier equals parsed expression modifier;
- die count equals parsed expression count;
- no duplicate die indices;
- die values reconstructed by original index produce the exact expected kept-index set for the parsed keep/drop selection, including deterministic tie-breaking;
- total exactly equals kept die sum plus modifier;
- `rolledAt` is a canonical ISO timestamp (`new Date(value).toISOString() === value`);
- optional stored seed is at most 200 characters;
- seeded-mode rolls must contain a seed.

A persisted record is therefore rejected even when it has the correct number of kept dice and a self-consistent total if the wrong actual dice are marked kept.

The user-configured seed is capped separately at 120 characters; the persisted effective seed may be longer because DiceLab appends deterministic sequence information.

## 5. Randomness mode contract

```ts
type RandomMode = 'secure' | 'seeded';
```

### Secure mode

Security property: output must come from a cryptographically appropriate operating-system/browser randomness source.

- Tauri desktop: Rust `OsRng`.
- Browser companion: Web Crypto.

Secure output is intentionally not reproducible.

### Seeded mode

Product property: the same effective seed and expression should reproduce the same deterministic values across TypeScript and Rust implementations.

The compatibility contract is protected by fixed reference-vector tests in both runtimes.

Seeded mode is not a cryptographic security mode and must remain visibly distinct from secure mode.

## 6. Preset contract

```ts
interface DicePreset {
  id: string;
  name: string;
  expression: string;
  description?: string;
  createdAt: string;
}
```

Persisted custom preset invariants:

- ID length 1–200;
- name length 1–80;
- valid dice expression;
- optional description ≤ 240 characters;
- canonical ISO creation timestamp.

### Reserved IDs

IDs starting with `builtin-` are reserved for application-defined presets.

Custom persistence and backup restoration remove/reject the idea that external data can redefine built-in presets. Built-ins are regenerated from trusted application code/catalogs.

### Localization rule

Built-in names/descriptions may change when locale changes. User-created name/expression/description data is not automatically translated.

### Shareable preset-file contract

Preset sharing is deliberately narrower than full backup/restore. The versioned file shape is:

```ts
interface SharedDicePreset {
  name: string;
  expression: string;
  description?: string;
}

interface DiceLabPresetFile {
  kind: 'dicelab-presets';
  schemaVersion: 1;
  exportedAt: string;
  presets: SharedDicePreset[];
}
```

Rules:

- only custom presets are exported; built-ins are excluded;
- local preset IDs and `createdAt` timestamps are never shared;
- expressions are parser-normalized before export and again during import validation;
- `exportedAt` must be a canonical ISO timestamp;
- selected files larger than 1,000,000 bytes are rejected from `File.size` before `File.text()` is called;
- decoded/serialized UTF-8 content is also capped at 1,000,000 bytes;
- at most 500 shared presets are accepted;
- each imported name is trimmed and must remain 1–80 characters;
- optional imported descriptions are trimmed and must be no longer than 240 characters;
- invalid dice expressions reject the file instead of being silently skipped;
- imported entries receive fresh collision-safe local IDs and a new local creation timestamp before entering storage;
- imported preset files do not modify history, settings, locale, or onboarding state.

Current preset-file validation codes are local to the preset-file service:

```text
preset-file-too-large
invalid-json
invalid-root
invalid-kind
unsupported-schema
invalid-export-timestamp
invalid-presets-shape
invalid-preset
```

UI presentation intentionally uses localized safe transfer status rather than exposing parser/file exception detail.

## 7. Probability contracts

### `ProbabilityPoint`

```ts
interface ProbabilityPoint {
  total: number;
  probability: number;
  ways: number;
}
```

### `ProbabilityDistribution`

```ts
interface ProbabilityDistribution {
  expression: string;
  points: ProbabilityPoint[];
  expectedValue: number;
  minimum: number;
  maximum: number;
  exact: boolean;
  totalOutcomes: number;
}
```

Current calculator outputs are advertised as exact only when the implementation can preserve the required count precision and stay within interactive complexity budgets.

### Derived insight contract

`src/domain/probability-insights.ts` consumes an already constructed exact distribution and derives:

```ts
interface ProbabilityInsights {
  median: number;
  modes: number[];
  variance: number;
  standardDeviation: number;
}

interface ThresholdProbabilities {
  exactly: number;
  atMost: number;
  atLeast: number;
}
```

Quantiles use the first ordered total whose cumulative probability reaches the requested quantile. Quantile input must be finite and in `[0, 1]`; `0` maps to the minimum and `1` maps to the maximum. Median is therefore the 0.5 lower exact quantile used by this distribution convention.

Modes are selected from the highest exact `ways` count, preserving all tied totals. Variance is the probability-weighted squared distance from the distribution's expected value, and standard deviation is its square root.

For integer threshold `n`:

```text
exactly = P(X = n)
atMost  = P(X ≤ n)
atLeast = P(X ≥ n)
```

Thresholds outside the distribution range naturally produce zero/one boundary probabilities at the domain layer; the UI constrains its interactive threshold input to the active distribution range.

### Pairwise comparison contract

`src/domain/probability-comparison.ts` compares two independent exact distributions without enumerating every raw dice-pair outcome:

```ts
interface ProbabilityComparison {
  leftHigher: number;
  tie: number;
  rightHigher: number;
  expectedDelta: number;
}
```

Semantics:

```text
leftHigher  = P(A > B)
tie         = P(A = B)
rightHigher = P(A < B)
expectedDelta = E[A] - E[B]
```

The three outcome probabilities must sum to one within floating-point tolerance. Tiny near-zero/near-one artifacts are clamped after combining exact distribution probability masses.

### Probability safety/performance bounds

| Mechanism | Limit |
| --- | --- |
| Ordinary-sum dynamic-programming cells | 250,000 |
| Enumerated keep/drop raw outcomes | 2,000,000 |
| Exact ordinary-sum raw outcome count | Must be a JavaScript safe integer |

Current probability error codes:

| Code | Meaning |
| --- | --- |
| `distribution-too-large` | Ordinary exact DP would exceed the configured interactive size |
| `unsafe-outcome-count` | Raw count cannot be represented as an exact safe integer |
| `keep-drop-too-complex` | Exact keep/drop enumeration exceeds configured raw-outcome limit |
| `empty-distribution` | Defensive invariant: calculation produced no points |

## 8. Settings contract

```ts
interface DiceLabSettings {
  theme: 'system' | 'light' | 'dark';
  locale: 'en' | 'hi';
  reducedMotion: boolean;
  animations: boolean;
  randomMode: 'secure' | 'seeded';
  seed: string;
  historyLimit: number;
}
```

Current defaults:

```text
theme          system
locale         en
reducedMotion  false
animations     true
randomMode     secure
seed           dicelab
historyLimit   500
```

Normalization rules:

- unsupported theme → default;
- unsupported locale → English default;
- unsupported random mode → secure default;
- seed → string truncated to 120 characters or default;
- history limit → safe integer clamped to 10–5,000 or default;
- reduced motion → boolean or default;
- when reduced motion is true, animations are forced false regardless of imported/stored animation value.

The Settings history-limit number control also truncates finite live input to an integer and clamps it to 10–5,000 before emitting application state, so live and persisted contracts agree.

## 9. Locale contract

Product locale IDs:

```text
en
hi
```

Presentation locale mapping:

```text
en -> en-US
hi -> hi-IN
```

The typed `MessageCatalog` is defined by the English catalog shape. The Hindi catalog must satisfy the same structure at compile time.

Locale changes apply to:

- navigation/labels/buttons/helper copy;
- error/status messages;
- built-in presets;
- application-generated number formatting;
- application-generated date/time formatting;
- document `lang` metadata.

Locale changes do not rewrite machine/user data such as expressions, IDs, ISO storage values, seeds, user preset names, or JSON/CSV field names.

Catalog-backed string values that need to react to live language changes must be read during render or from a function called during render; a module-level primitive string captured from `messages.*` does not become live merely because the exported `messages` binding changes.

## 10. Local-storage contract

Current versioned keys:

| Key | Value |
| --- | --- |
| `dicelab.history.v1` | JSON array of validated `RollResult` values |
| `dicelab.presets.v1` | JSON array of custom `DicePreset` values only |
| `dicelab.settings.v1` | JSON `DiceLabSettings` object |
| `dicelab.onboarded.v1` | String `true` after onboarding completion |

Collection bounds:

```text
history        <= 5,000 (and <= active historyLimit)
custom presets <= 500
```

Reading local storage is a validation boundary. TypeScript type declarations do not make persisted JSON trusted.

## 11. Backup schema contract

Current schema:

```ts
interface DiceLabBackup {
  schemaVersion: 1;
  exportedAt: string;
  history: RollResult[];
  presets: DicePreset[];
  settings: DiceLabSettings;
}
```

### Export rules

- `schemaVersion` is exactly `1`;
- `exportedAt` is current ISO timestamp;
- history is included;
- only custom presets are included;
- settings are included, including locale;
- pretty-printed backup JSON must be no larger than 5,000,000 UTF-8 bytes before DiceLab will save/download it.

Built-in presets are intentionally absent so a backup cannot redefine application-owned built-ins.

`backupToJson()` and `parseBackupJson()` use the same `assertBackupSize()` byte check. This is a deliberate round-trip invariant: DiceLab must not knowingly produce a backup that its own importer rejects solely because of file size.

For browser-selected restore files, `parseBackupFile()` adds a first-stage `File.size` check before calling `File.text()`. Files larger than 5,000,000 bytes are therefore rejected without reading them into memory. After the read, `parseBackupJson()` still measures the decoded string's actual UTF-8 byte length with `TextEncoder`; both stages use the same stable `backup-too-large` error/context.

An oversized export is not truncated. It fails with the stable `backup-too-large` error and the existing localized 5 MB user message. This backup-specific 5,000,000-byte limit is intentionally stricter than the native text-save command's generic 6,000,000-byte transport limit.

### Import/export bounds

| Value | Limit |
| --- | --- |
| Selected backup file metadata size before read | 5,000,000 bytes |
| Backup JSON UTF-8 size (export and decoded import) | 5,000,000 bytes |
| History records | 5,000 |
| Custom preset records | 500 |

### Backup validation errors

Current stable codes:

```text
backup-too-large
invalid-json
invalid-root
unsupported-schema
invalid-history-shape
invalid-presets-shape
invalid-history-entry
invalid-preset
duplicate-roll-ids
duplicate-preset-ids
invalid-export-timestamp
invalid-settings
invalid-theme
invalid-random-mode
```

Settings fields that can be safely normalized without changing schema meaning (including missing/unsupported locale in compatible schema-v1 data) use safe defaults. Structurally ambiguous/corrupt roll/preset collections are rejected.

## 12. History CSV contract

Column order:

```text
id
rolled_at
expression
total
modifier
mode
seed
dice
```

The `dice` field flattens values and marks dropped entries in human-readable form.

CSV escaping/security rules:

- untrusted `id` and `seed` values whose first non-whitespace character is `=`, `+`, `-`, or `@` are prefixed with `'` before normal escaping;
- application-generated numeric `total` and `modifier` values remain numeric, including negative values;
- cells containing quote/comma/newline are quoted;
- embedded quotes are doubled;
- output ends with a newline.

This is an interoperability/export format, not a replacement for the richer JSON backup schema.

## 13. Text export service contract

Frontend API:

```ts
saveTextExport(
  filename: string,
  contents: string,
  mimeType: string,
  format: 'csv' | 'json',
): Promise<boolean>
```

Return meaning:

- `true` → output operation completed/started successfully for the runtime;
- `false` → native OS save dialog was canceled normally;
- thrown failure → export could not be completed; UI should show a safe localized fallback.

`mimeType` is used by the browser Blob path. Native validation is based on the explicit format allowlist rather than trusting renderer MIME text.

Content-specific serializers may impose stricter limits before this generic output boundary is reached. In particular, backup JSON is capped at 5,000,000 UTF-8 bytes so a saved backup remains acceptable to DiceLab's own restore boundary, while shareable preset JSON is capped at 1,000,000 bytes and the native generic text command accepts at most 6,000,000 bytes.

## 14. Native roll command contract

Command name:

```text
roll_expression
```

Renderer inputs:

```text
expression: string
mode: string
seed: string | null/undefined
```

Rust reparses and revalidates the expression rather than trusting renderer domain objects.

Native serialized result uses camelCase and contains:

```text
expression
total
dice[] { value, kept, index }
modifier
```

The frontend service supplies application metadata such as ID/timestamp/effective seed when adapting the native result into the shared `RollResult` contract.

## 15. Native save command contract

Command name:

```text
save_text_export
```

Renderer-controlled inputs:

```text
filename: string
contents: string
format: 'csv' | 'json'
```

The destination path is **not** renderer-controlled.

Rust bounds:

| Value | Limit |
| --- | --- |
| Suggested filename | 160 bytes |
| Generic text export payload | 6,000,000 bytes |
| Formats | CSV or JSON only |

Filename rules:

- non-empty;
- no control characters;
- no `/` or `\` path separator;
- expected extension must match requested format.

After the OS dialog returns a path, Rust checks the final selected extension again before writing.

Cancellation returns `Ok(false)`. Failures use generic messages that avoid embedding the selected private path.

## 16. Native command allowlist

The current reviewed renderer→Rust product command set is exactly:

```text
roll_expression
save_text_export
```

Frontend routing:

```text
roll_expression    -> src/services/roll-service.ts
save_text_export   -> src/services/export.ts
```

The repository command-contract audit rejects unknown commands, dynamic command names, wrong adapter locations, missing handler entries, and duplicate/unapproved Rust handler entries.

## 17. Runtime detection contract

`src/services/runtime.ts` owns the production decision about whether Tauri internals are present.

Other production modules should depend on that function instead of directly probing `__TAURI_INTERNALS__`.

Direct `@tauri-apps/api/core` access is restricted by repository policy to the reviewed native service adapters.

## 18. Structured logging contract

Diagnostics are local and structured. The logger normalizes:

```text
timestamp
level
event
bounded/redacted context
```

Sensitive key families are redacted/omitted, including credentials, seeds, user content/history/presets/backups, personal identifiers, raw exception messages, and stacks.

Logging does not define a remote telemetry contract.

## 19. Version contract

The current candidate application version is `2.0.12`.

Machine-readable version agreement spans:

```text
package.json
package-lock.json (top-level version)
package-lock.json packages[""] (root package version)
src/config/app.ts
src-tauri/Cargo.toml
src-tauri/Cargo.lock (the [[package]] entry whose name is "dicelab")
src-tauri/tauri.conf.json
```

`npm run version:check` parses all of those locations and requires exact SemVer agreement. When `DICELAB_EXPECT_VERSION` is supplied (for example `v2.0.12` on a release tag), the normalized tag must also equal the synchronized application version.

This intentionally makes generated lock metadata part of the release version contract. Bumping a manifest/config value without regenerating its lockfile must fail the version gate rather than presenting a partially updated candidate as synchronized.

`CHANGELOG.md` is the human-reviewed release record and is not parsed as a machine version source because it can contain both unreleased and candidate/released versions.

## 20. Dependency-lock contract

Manifest-to-lock relationship:

```text
package.json            -> package-lock.json
src-tauri/Cargo.toml    -> src-tauri/Cargo.lock
```

Manifest, dependency, or application-version changes are not considered reproducibly verified until generated lockfiles are committed and locked package-manager checks succeed.

The npm lock must carry the same application version in both its top-level `version` and `packages[""]` root package metadata. The Cargo lock must contain the DiceLab package entry at the same application version and must include every direct crate dependency resolved from the current manifest, including both `tauri-plugin-dialog` and the direct `tauri-plugin-fs` mobile export dependency for the 2.0.12 candidate.

`npm run policy:lockfiles` performs an early structural direct-dependency consistency check. `npm run version:check` performs the cross-file package-version agreement check. Neither command replaces normal package-manager lockfile generation/resolution or locked Rust/npm installation/testing.

Do not manually synthesize Cargo's transitive graph; use Cargo to regenerate it.

## 21. Compatibility-change checklist

When changing a contract above, review all relevant layers:

- TypeScript type definitions;
- parser/engine/probability behavior;
- persisted-data validation;
- storage normalization/versioning;
- backup and shareable-preset schema/import/export compatibility;
- English/Hindi catalogs and stable error mapping;
- browser/native service adapters;
- Rust command input/output/validation;
- seeded parity vectors;
- package/Cargo/Tauri/generated-lock version metadata;
- unit/component/integration/E2E/fuzz tests;
- policy audits;
- architecture/ADR/release documentation;
- release-candidate evidence.

If compatibility cannot be preserved safely, version the affected persisted/export contract explicitly instead of silently changing the meaning of an existing version.