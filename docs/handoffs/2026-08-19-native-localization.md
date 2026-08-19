# DiceLab Native Export and Localization Handoff — 2026-08-19

This handoff preserves the milestone implemented between the earlier general hardening work and the later repository-policy hardening wave.

Related history:

- [`2026-08-19-pre-native-exports.md`](2026-08-19-pre-native-exports.md)
- [`2026-08-19-policy-hardening.md`](2026-08-19-policy-hardening.md)
- [`../../what_changed.md`](../../what_changed.md)

## Milestone scope

This milestone implemented the major code-completable roadmap gaps that remained after the earlier verification/quality work:

- reviewed Hindi locale;
- persisted English/Hindi selection;
- locale-aware number/date/time presentation;
- localized built-in presets without translating user-created content;
- backup compatibility for locale settings;
- native desktop CSV/JSON save dialogs through a bounded Rust command;
- browser export fallback preservation;
- native export validation and localized safe failure handling;
- coverage-guided Rust parser fuzzing plus scheduled/manual automation;
- documentation/testing updates for the new boundaries.

## Hindi catalog

Added `src/i18n/hi.ts` as the first reviewed non-English DiceLab catalog.

Coverage includes:

- navigation;
- roll workspace;
- history/statistics;
- probability;
- Settings;
- onboarding;
- command palette;
- About/privacy/support;
- parser/probability/backup errors;
- export/import status feedback;
- built-in preset names/descriptions.

Technical identifiers and dice notation remain unchanged where translation would reduce clarity or invalidate examples.

Representative commits:

- `4400f620` — `feat: add reviewed Hindi message catalog`
- `d104d6ab` — `feat: register Hindi locale catalog`
- `58557310` — `test: cover Hindi locale registry and helpers`
- `ef118cd0` — `docs: add Hindi localization review record`

## Persisted locale preference

`DiceLabSettings` now stores:

```ts
locale: 'en' | 'hi'
```

English remains the default.

Changing language:

- switches the live message catalog;
- persists through local settings;
- updates `document.documentElement.lang`;
- regenerates localized built-in presets;
- leaves user-created names, descriptions, expressions, seeds, identifiers, history records, and exported values unchanged.

Schema-v1 backup behavior:

- supported locale round-trips;
- older backups with no locale default to English;
- unsupported locale values fall back safely to English.

Representative commits:

- `412253b3` — `feat: persist locale in DiceLab settings`
- `ee6aa887` — `feat: allow switching the active message catalog`
- `cfa4d556` — `feat: add language preference copy`
- `2cb22ac8` — `feat: translate language preference copy`
- `2ca81a50` — `feat: localize built in presets and stored locale`
- `0a9b8cb2` — `feat: preserve locale across backup restore`
- `e5478b3f` — `feat: add persisted language selector`
- `71e1b625` — `feat: apply locale across the live application`
- `efdac10b` — `test: cover live locale switching`
- `5f37feae` — `test: cover localized presets and stored locale`
- `485dd451` — `test: cover locale backup compatibility`
- `babae0ab` — `test: cover language preference changes`
- `72f65956` — `test: cover live Hindi application switching`

## Locale-aware presentation formatting

Added `src/i18n/format.ts` and active-locale state in `src/i18n/index.ts`.

Explicit mappings:

- `en` → `en-US`
- `hi` → `hi-IN`

Helpers cover:

- integers;
- bounded decimals;
- fixed decimals;
- date/time;
- time-only presentation.

Applied to Roll:

- result time;
- total;
- die values;
- modifier values.

Applied to History:

- roll count;
- average/median/range;
- histogram counts/totals;
- roll totals;
- die values;
- timestamps.

Applied to Probability:

- expected value;
- range;
- finite outcome count;
- chart totals;
- percentages.

Representative commits:

- `ce3dda10` — `feat: expose active locale for formatting`
- `45601aaf` — `test: cover active locale state`
- `51c38f1d` — `feat: add locale aware number and date formatters`
- `914bd653` — `test: cover locale aware formatting helpers`
- `d751e376` — `feat: format history timestamps with active locale`
- `e7e5c091` — `feat: localize probability number formatting`
- `614e9da6` — `test: cover localized probability presentation`
- `c0c1bd69` — `feat: localize history statistic formatting`
- `4548c4a5` — `feat: add locale aware time formatter`
- `f4c28fb9` — `feat: localize roll result presentation`
- `df25cffc` — `test: cover localized roll result presentation`

## Native desktop export boundary

Browser builds retain the Blob/download path.

Tauri desktop builds route text exports through the Rust command:

```text
save_text_export
```

The renderer supplies only:

- a bounded suggested filename;
- bounded text contents;
- an allowlisted `csv` or `json` format.

The renderer does not provide an arbitrary destination path.

Rust opens the operating-system save dialog, obtains the selected destination from the native dialog, revalidates the selected extension, and writes only to that path.

Current command validation includes:

- non-empty filename;
- filename length bound;
- no control characters;
- no `/` or `\\` path separators;
- exact CSV/JSON format allowlist;
- matching suggested extension;
- payload size bound;
- matching final selected extension.

Current native limits at this milestone:

- suggested filename: 160 bytes;
- text payload: 6,000,000 bytes.

Canceling returns a normal `false` result and does not trigger the browser fallback. UI failures are localized/generic and do not expose private selected paths or raw OS error text.

Covered flows:

- filtered History CSV;
- filtered History JSON;
- full DiceLab JSON backup.

Representative commits:

- `ca3776c4` — `build: add native dialog dependency`
- `43cb4b07` — `feat: add native scoped export save command`
- `cd045f03` — `refactor: centralize runtime detection`
- `76c65614` — `refactor: reuse shared runtime detection`
- `0a75f0d1` — `feat: route desktop exports through native save dialog`
- `1efd2c37` — `feat: add localized export status messages`
- `ebed4fb6` — `feat: translate export status messages`
- `c3a976d0` — `feat: add resilient history export feedback`
- `f9ae29ae` — `feat: use native save flow for backup exports`
- `e198ad3e` — `feat: surface backup export save status`
- `b084fc53` — `test: cover browser and native export routing`
- `8190f82b` — `test: cover backup export status handling`
- `556950a8` — `test: cover history export feedback`
- `86291723` — `security: validate selected native export extension`
- `c94bc0b0` — `test: cover browser and Tauri runtime detection`

## Native export documentation

Added/updated during the milestone:

- `docs/native-exports.md`
- `SECURITY.md`
- `README.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `docs/testing.md`
- `docs/release.md`
- `docs/localization.md`
- `docs/localization/HINDI_REVIEW.md`

The accepted ADR was added immediately afterward at:

- `docs/adr/native-export-boundary.md`

## Rust parser fuzzing

Added:

- parent `fuzzing` feature gate;
- `fuzz_parse_expression()` production invariant hook;
- `src-tauri/fuzz/Cargo.toml`;
- `src-tauri/fuzz/fuzz_targets/parser.rs`;
- `src-tauri/fuzz/README.md`;
- `.github/workflows/fuzz.yml`;
- generated fuzz-artifact ignore rules.

Invariant:

If arbitrary UTF-8 input parses successfully, normalized output must parse again and preserve:

- dice count;
- side count;
- modifier;
- normalized representation.

The workflow supports manual dispatch and a bounded weekly 60-second parser campaign with Rust nightly/cargo-fuzz.

Representative commits:

- `16aa9895` — `build: add parser fuzzing feature gate`
- `0a35b51d` — `test: expose parser invariant fuzz hook`
- `f4ffc621` — `test: add cargo fuzz harness manifest`
- `1ff4a8dc` — `test: add coverage guided parser fuzz target`
- `251866cd` — `docs: document parser fuzzing workflow`
- `e05fdbed` — `chore: ignore cargo fuzz generated artifacts`
- `49e36b1e` — `ci: add scheduled Rust parser fuzz campaign`

A configured fuzz workflow does not prove a campaign passed; that remains release evidence.

## Lockfile workflow hardening

The native dialog dependency changed `src-tauri/Cargo.toml` and therefore requires a regenerated Cargo lockfile before locked Rust checks can be considered release-ready.

The lockfile workflow was updated to:

- support manual `workflow_dispatch`;
- generate npm and Cargo locks;
- preserve the repository commit identity configured for automation;
- try direct `main` update;
- if protected `main` rejects it, publish the exact generated commit to `automation/lockfiles`.

Representative commits:

- `aef6ddae` — `ci: allow manual dependency lockfile refresh`
- `c17ece11` — `ci: preserve generated lockfiles when main is protected`

## Dependency blocker at milestone handoff

At the last observed state for this milestone:

- `src-tauri/Cargo.toml` contains `tauri-plugin-dialog = "2.7.2"`;
- the committed `src-tauri/Cargo.lock` had not yet been observed containing that direct dependency;
- the generated automation fallback branch had not been observed;
- locked Rust checks for the new dependency graph were therefore not claimed green.

The later policy-hardening wave added a structural manifest/lock audit and a release-tag gate for this exact class of inconsistency. See [`2026-08-19-policy-hardening.md`](2026-08-19-policy-hardening.md).

## Verification rule

Do not reinterpret implemented code or configured workflows as release evidence.

Still evidence-gated after this milestone:

- regenerated committed Cargo lockfile;
- locked Rust tests/Clippy;
- full real-browser E2E on unrestricted infrastructure;
- observed parser fuzz campaign;
- release-candidate benchmark evidence;
- clean Windows/macOS/Linux candidate builds;
- native save-dialog smoke on every desktop platform;
- English/Hindi visual/accessibility review;
- real candidate screenshots;
- signing/notarization where configured;
- CodeQL/dependency/security review;
- artifact checksum/provenance review;
- `v0.1.0` publication.
