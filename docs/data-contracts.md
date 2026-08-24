# DiceLab Data and Boundary Contracts

This document records stable shapes, limits, invariants, and compatibility rules across DiceLab module/runtime boundaries.

## 1. Dice expression contract

```ts
interface DiceExpression {
  count: number;
  sides: number;
  modifier: number;
  selection?: DiceSelection;
  normalized: string;
}
```

Supported compact selection syntax: `kh`, `kl`, `dh`, `dl`.

Parser bounds:

| Value | Limit |
| --- | --- |
| Dice count | 1–1,000 |
| Sides per die | 2–1,000,000 |
| Absolute modifier | ≤ 1,000,000,000 |
| Keep count | ≥ 1 and ≤ dice count |
| Drop count | ≥ 1 and must leave at least one die |

Normalization removes irrelevant whitespace, makes the leading count explicit, canonicalizes selection notation, and emits a compact signed modifier.

## 2. Parser error contract

`DiceExpressionError` uses stable codes:

```text
invalid-format
dice-count-out-of-range
side-count-out-of-range
modifier-out-of-range
selection-count-too-small
keep-count-exceeds-dice
drop-count-removes-all
```

React presentation maps code/context through `src/i18n/errors.ts`; raw developer exception prose is not the UI contract.

## 3. Roll result contract

```ts
interface DieRoll {
  value: number;
  kept: boolean;
  index: number;
}

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

Persisted/imported validation requires valid expression, canonical timestamp, unique in-range die indices/values, exact keep/drop mask semantics with deterministic tie-breaking, matching modifier/total, bounded ID/seed, and a seed for seeded-mode records.

## 4. Randomness contract

Secure mode uses cryptographically appropriate sources:

- Tauri native: Rust `OsRng`;
- browser: Web Crypto with rejection sampling.

Seeded mode is deterministic, non-cryptographic, and protected by matching TypeScript/Rust FNV-1a + xorshift32 compatibility vectors.

## 5. Preset contract

```ts
interface DicePreset {
  id: string;
  name: string;
  expression: string;
  description?: string;
  createdAt: string;
}
```

Custom preset bounds:

- ID: 1–200 characters;
- name: 1–80 characters;
- valid dice expression;
- optional description ≤ 240 characters;
- canonical ISO `createdAt`.

IDs beginning with `builtin-` are application-reserved. Built-ins are regenerated from trusted catalog/application code; user-created content is not automatically translated.

### Shareable preset file

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

- custom presets only; built-ins excluded;
- local IDs and creation timestamps are never shared;
- expressions are parser-normalized;
- canonical ISO export timestamp;
- selected file metadata and decoded/serialized UTF-8 content ≤ 1,000,000 bytes;
- selected oversized files are rejected before `File.text()`;
- at most 500 presets;
- names trimmed to 1–80 characters;
- descriptions trimmed and ≤ 240 characters;
- any invalid expression rejects the file;
- imported accepted entries receive fresh collision-safe local IDs and local timestamps;
- import changes preset state only—not history/settings/locale/onboarding.

### Shared-preset duplicate rule

`selectNewSharedPresets()` compares normalized content keys:

```text
[name.trim(), normalizedExpression, description.trim() or ""]
```

An incoming preset is skipped when the same normalized content already exists locally or appeared earlier in the same imported file. Duplicate import is therefore idempotent. Same expression with a different name/description remains a distinct preset.

Preset-file validation codes:

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

The UI exposes safe localized transfer status rather than raw file/parser exception details.

## 6. History analytics contract

`src/domain/history-analytics.ts` derives expression-level analytics from an in-memory `RollResult[]` without mutating or persisting data:

```ts
interface ExpressionHistorySummary {
  expression: string;
  count: number;
  percentage: number;
  mean: number;
  minimum: number;
  maximum: number;
  lastRolledAt: string;
}
```

Semantics:

- grouping key is the stored normalized `roll.expression`;
- `percentage = count / activeCollectionLength * 100`;
- mean/minimum/maximum use roll totals;
- latest timestamp is the maximum canonical ISO timestamp within the group;
- ordering is count descending, then latest timestamp descending, then expression ascending;
- empty input returns `[]`.

`HistoryPanel` applies this to the active filtered history. Its top-expression rendering limit is presentation-only; overall statistics, histogram inputs, history rows, and exports retain their existing full filtered scopes.

## 7. Probability distribution contract

```ts
interface ProbabilityPoint {
  total: number;
  probability: number;
  ways: number;
}

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

Exactness/performance limits:

| Mechanism | Limit |
| --- | --- |
| Ordinary-sum DP cells | 250,000 |
| Enumerated keep/drop raw outcomes | 2,000,000 |
| Ordinary raw outcome count | JavaScript safe integer required |

Stable probability failure codes:

```text
distribution-too-large
unsafe-outcome-count
keep-drop-too-complex
empty-distribution
```

## 8. Probability insight contract

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

Quantiles use the first ordered total whose cumulative probability reaches the requested finite quantile in `[0,1]`. Modes use the greatest exact `ways` value and preserve ties. Threshold semantics are `P(X=n)`, `P(X≤n)`, and `P(X≥n)`.

## 9. Pairwise probability comparison contract

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
leftHigher    = P(A > B)
tie           = P(A = B)
rightHigher   = P(A < B)
expectedDelta = E[A] - E[B]
```

Comparison consumes two already guarded exact distributions and does not enumerate every raw dice-pair outcome. Tiny floating artifacts near zero/one may be clamped after combining exact probability masses.

The stacked comparison meter is presentation-only and must expose all three probabilities through an accessible label; it does not alter comparison mathematics.

## 10. Settings and locale contract

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

Defaults: system theme, English locale, reduced motion off, animations on, secure random mode, seed `dicelab`, history limit 500.

Normalization:

- unsupported theme/locale/random mode → default;
- seed truncated to 120 characters;
- history limit safe integer clamped 10–5,000;
- reduced motion forces animations false.

Presentation locale mapping:

```text
en -> en-US
hi -> hi-IN
```

Locale changes translate application copy/built-ins and number/date/time presentation, but do not rewrite user content, dice syntax, IDs, ISO storage values, seeds, or export field names.

## 11. Local storage contract

```text
dicelab.history.v1     validated RollResult[]
dicelab.presets.v1     custom DicePreset[] only
dicelab.settings.v1    DiceLabSettings
dicelab.onboarded.v1   "true" after onboarding
```

Bounds:

```text
history        <= 5,000 and <= active historyLimit
custom presets <= 500
```

Persisted JSON is always untrusted input at read time.

## 12. Backup schema contract

```ts
interface DiceLabBackup {
  schemaVersion: 1;
  exportedAt: string;
  history: RollResult[];
  presets: DicePreset[];
  settings: DiceLabSettings;
}
```

Rules:

- custom presets only; built-ins excluded;
- settings include locale;
- export/import UTF-8 size ≤ 5,000,000 bytes;
- selected oversized files rejected before text read;
- ≤ 5,000 history records and ≤ 500 custom presets;
- duplicate restored IDs rejected;
- structural/semantic roll/preset inconsistencies rejected;
- compatible missing/unsupported locale can safely normalize to English.

## 13. CSV contract

Column order:

```text
id, rolled_at, expression, total, modifier, mode, seed, dice
```

Untrusted `id`/`seed` cells beginning after optional whitespace with `=`, `+`, `-`, or `@` are neutralized for spreadsheet safety. Numeric total/modifier columns remain numeric, including negative values. Standard CSV quote/comma/newline escaping applies.

## 14. Text export contract

```ts
saveTextExport(
  filename: string,
  contents: string,
  mimeType: string,
  format: 'csv' | 'json',
): Promise<boolean>
```

`true` = completed/started successfully; `false` = normal native save-dialog cancellation; thrown failure = safe UI error path.

Browser uses Blob/download. Tauri invokes the bounded native save command. Backup and preset serializers may apply stricter content limits before this generic output boundary.

## 15. Native command contract

Reviewed renderer→Rust product commands are exactly:

```text
roll_expression
save_text_export
```

Frontend routing:

```text
roll_expression  -> src/services/roll-service.ts
save_text_export -> src/services/export.ts
```

Native roll reparses expression input. Native save accepts only a bounded suggested filename, bounded text content, and `csv`/`json`; the destination is chosen by the operating-system dialog, never supplied by the renderer.

Native text-save bounds:

| Value | Limit |
| --- | --- |
| Suggested filename | 160 bytes |
| Generic payload | 6,000,000 bytes |
| Formats | CSV or JSON |

Android document-provider and iOS security-scoped destinations remain behind the Rust/plugin boundary.

## 16. Runtime and logging contracts

`src/services/runtime.ts` is the sole production Tauri runtime detector. Repository policy restricts direct Tauri core access/runtime probing to reviewed adapters.

Diagnostics are local structured records only. Sensitive key families/user content/seeds/backups/personal identifiers/raw error messages/stacks are redacted or omitted. No remote telemetry contract exists.

## 17. Version contract

Current source candidate version: **2.0.13**.

Machine-readable agreement spans:

```text
package.json
package-lock.json top-level version
package-lock.json packages[""] version
src/config/app.ts
src-tauri/Cargo.toml
src-tauri/Cargo.lock dicelab package version
src-tauri/tauri.conf.json
```

At the current 2.0.13 preparation point, source manifests/configuration are 2.0.13 while generated lock application metadata is still awaiting lockfile-workflow regeneration. `npm run version:check` must not be considered passing until all seven locations agree.

When `DICELAB_EXPECT_VERSION` is supplied, the normalized release tag must also match the synchronized application version.

## 18. Dependency-lock contract

```text
package.json         -> package-lock.json
src-tauri/Cargo.toml -> src-tauri/Cargo.lock
```

Manifest or application-version changes are not reproducibly synchronized until package-manager-generated lockfiles are committed and locked checks succeed.

`npm run policy:lockfiles` checks direct dependency structure. `npm run version:check` checks application-version agreement. Neither replaces npm/Cargo lock generation.

Do not manually synthesize or edit Cargo's transitive graph to bypass a release gate.

## 19. Compatibility-change checklist

When changing a contract above, review as relevant:

- types and domain logic;
- persistence/storage validation;
- backup/preset schema compatibility;
- English/Hindi copy and locale formatting;
- browser/native adapters and Rust validation;
- deterministic parity vectors;
- manifest/config/generated-lock versions;
- unit/component/integration/E2E/fuzz/benchmark coverage;
- policy audits and release documentation/evidence.

If compatibility cannot be safely preserved, version the affected persisted/export contract explicitly rather than silently changing an existing schema meaning.
