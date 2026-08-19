# DiceLab — Current Work Handoff

Last updated: 2026-08-19

This file is the current continuation ledger for DiceLab. The previous full implementation handoff was preserved byte-for-byte before this refresh at:

- [`docs/handoffs/2026-08-19-pre-native-exports.md`](docs/handoffs/2026-08-19-pre-native-exports.md)

That archive contains the earlier Phase 4/5 hardening record, verification limitations, and 86-commit ledger. Do not delete it when continuing work.

## Current milestone

The main code-completable gaps that remained in the previous roadmap have now been implemented:

- reviewed Hindi locale;
- persisted English/Hindi language selection;
- active-locale number/date/time formatting;
- localized built-in presets without rewriting user content;
- locale persistence and backup compatibility;
- native desktop save-dialog exports through a bounded Rust command;
- browser export fallback preservation;
- native export security validation and safe failure handling;
- coverage-guided Rust parser fuzzing;
- scheduled/manual fuzz workflow;
- expanded localization/native-export/fuzz testing and documentation.

The project is **not** being called release-ready yet. Evidence-gated work remains open, especially the Rust lockfile refresh required by the newly added native dialog dependency and the final release-candidate verification matrix.

## Repository identity

- Repository: `https://github.com/sanskarIN/dicelab`
- Default branch: `main`
- License: MIT
- Application version: `0.1.0`
- Primary business email: `sanskarin@outlook.in`
- Support email: `supportramsandesh@gmail.com`
- Product credit: **Made by the Sanskar**

## Previous handoff archive

Commit:

- `73938697` — `docs: archive previous implementation handoff`

The archive reuses the exact previous `what_changed.md` Git blob rather than manually copying/reformatting it, so the older implementation history is preserved exactly.

## Temporary handoff cleanup

The temporary continuation marker was consumed and removed:

- `6971f069` — `chore: remove continuation handoff marker`

## Hindi localization

### Reviewed catalog

Added `src/i18n/hi.ts` as the first reviewed non-English catalog.

The Hindi catalog covers:

- navigation;
- roll workspace;
- history/statistics;
- probability calculator;
- settings;
- onboarding;
- command palette;
- About/privacy/support copy;
- parser/probability/backup errors;
- import/export status feedback;
- built-in presets.

Important design rule: technical identifiers and dice syntax remain unchanged where translating them would reduce clarity or invalidate examples.

Representative commits:

- `4400f620` — `feat: add reviewed Hindi message catalog`
- `d104d6ab` — `feat: register Hindi locale catalog`
- `58557310` — `test: cover Hindi locale registry and helpers`
- `ef118cd0` — `docs: add Hindi localization review record`

## Persisted language preference

`DiceLabSettings` now stores:

```ts
locale: 'en' | 'hi'
```

English remains the default.

Changing language in Settings now:

- switches the live catalog;
- persists locally;
- updates `document.documentElement.lang`;
- regenerates built-in preset copy from the selected locale;
- leaves user-created preset names, expressions, seeds, identifiers, history records, and exports unchanged.

Backup compatibility:

- supported locale is preserved on backup round trip;
- legacy schema-v1 backups with no locale default safely to English;
- unsupported locale values default safely to English.

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

## Active-locale presentation formatting

The language selector now controls application-generated presentation formatting as well as words.

Added `src/i18n/format.ts` with explicit locale mapping:

- `en` → `en-US`
- `hi` → `hi-IN`

Shared formatting helpers now cover:

- integer formatting;
- bounded decimals;
- fixed decimals;
- date/time formatting;
- time-only formatting.

Applied to the Roll surface:

- result time;
- total;
- die values;
- modifier values.

Applied to History:

- roll count;
- mean;
- median;
- range;
- histogram counts/totals;
- individual roll totals;
- die values;
- timestamps.

Applied to Probability:

- expected value;
- range;
- finite outcome counts;
- chart totals;
- percentage labels.

This fixes the case where Hindi UI copy could previously coexist with unrelated host-locale numeric/date formatting.

Commits:

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

## Localization documentation

Updated:

- `docs/localization.md`
- `docs/localization/HINDI_REVIEW.md`
- `README.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `docs/testing.md`
- `docs/release.md`

The contributor rules now explicitly require new locale-sensitive display values to use the shared formatting boundary rather than default-host-locale `Intl`/`toLocaleString` calls.

Recent documentation commits:

- `2637d357` — `docs: record locale aware presentation formatting`
- `859fac6e` — `docs: update localization workflow for Hindi and Intl formatting`
- `86be60fb` — `docs: record native exports and locale formatting`

## Native desktop save dialogs

### Runtime architecture

Browser builds retain the existing Blob/download flow.

Tauri desktop builds now route CSV/JSON exports through a purpose-built Rust command:

```text
save_text_export
```

The frontend supplies:

- a bounded suggested filename;
- text contents;
- the requested `csv` or `json` format.

The frontend does **not** supply an arbitrary filesystem destination path.

The Rust command opens the operating-system save dialog and writes only to the path chosen there.

### Native validation

Before opening/writing, the native command validates:

- suggested filename is non-empty;
- suggested filename length is bounded;
- no control characters;
- no `/` or `\\` path separators;
- format is exactly `csv` or `json`;
- suggested filename extension matches the format;
- payload is bounded;
- the final selected path extension still matches the requested format.

Current native export payload limit:

```text
6,000,000 bytes
```

Suggested filename limit:

```text
160 bytes
```

Cancellation returns `false` and does not silently fall back to a browser download.

Native save failures shown to the user are localized generic messages. Private selected filesystem paths and raw OS error text are not surfaced by the UI.

### Export flows using the native boundary

- filtered History CSV;
- filtered History JSON;
- full DiceLab JSON backup.

### Runtime adapter

Added `src/services/runtime.ts` so rolling/export code uses one consistent Tauri/browser detection boundary.

### Relevant commits

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

## Native export security documentation

Added:

- `docs/native-exports.md`

Updated:

- `SECURITY.md`
- `README.md`
- `docs/testing.md`
- `docs/release.md`
- `CHANGELOG.md`

The webview still has no broad arbitrary filesystem-write capability. Future export formats must extend the dedicated native allowlist and tests rather than replacing the bounded command with a general write primitive.

Commits:

- `9f221e5a` — `docs: document native export trust boundary`
- `dc14bb01` — `docs: define native export security boundary`
- `57ab93af` — `docs: expose localization and native export features`
- `1b0054ac` — `docs: add native export locale and fuzz verification guidance`
- `0958ea05` — `docs: require lock refresh and native export release smoke`

## Rust parser fuzzing

Added coverage-guided native parser fuzzing.

Files:

- `src-tauri/fuzz/Cargo.toml`
- `src-tauri/fuzz/fuzz_targets/parser.rs`
- `src-tauri/fuzz/README.md`
- `.github/workflows/fuzz.yml`

The parent crate exposes `fuzz_parse_expression()` only under the `fuzzing` feature.

Invariant checked after arbitrary UTF-8 input:

- if parsing succeeds, normalized output must parse again;
- count must remain equal;
- sides must remain equal;
- modifier must remain equal;
- normalized representation must remain equal.

The GitHub Actions fuzz workflow supports:

- manual dispatch;
- weekly bounded execution;
- Rust nightly;
- `cargo-fuzz`;
- 60-second parser campaign.

Generated corpus/build/crash output stays ignored. Actionable minimized cases should become deterministic Rust regression tests.

Commits:

- `16aa9895` — `build: add parser fuzzing feature gate`
- `0a35b51d` — `test: expose parser invariant fuzz hook`
- `f4ffc621` — `test: add cargo fuzz harness manifest`
- `1ff4a8dc` — `test: add coverage guided parser fuzz target`
- `251866cd` — `docs: document parser fuzzing workflow`
- `e05fdbed` — `chore: ignore cargo fuzz generated artifacts`
- `49e36b1e` — `ci: add scheduled Rust parser fuzz campaign`

Important: the workflow exists, but a green fuzz campaign has not been observed through the available repository execution evidence, so that release evidence remains open.

## Dependency lockfile state — release blocker

Adding native dialog support changed `src-tauri/Cargo.toml`:

```toml
tauri-plugin-dialog = "2.7.2"
```

The currently observed `src-tauri/Cargo.lock` is still the previous dependency graph and does not contain the new dialog plugin.

The existing lock already resolves current Tauri 2.11.x dependencies, so the source-level Tauri/plugin major-version relationship is compatible. However, the plugin introduces additional Cargo dependencies and the lockfile must be generated normally rather than hand-edited.

Because normal Rust CI uses `--locked`, this is a real verification blocker.

### Lockfile workflow improvements

Updated `.github/workflows/lockfiles.yml` to:

- support `workflow_dispatch`;
- generate both npm and Cargo lockfiles;
- retain the configured repository commit identity in the workflow;
- try a normal direct `main` update;
- if protected `main` rejects the update, publish the exact generated commit to `automation/lockfiles` for review/application.

Commits:

- `aef6ddae` — `ci: allow manual dependency lockfile refresh`
- `c17ece11` — `ci: preserve generated lockfiles when main is protected`

### Current observed state

At this handoff:

- the Cargo manifest contains `tauri-plugin-dialog = "2.7.2"`;
- the Cargo lockfile has not yet regenerated in the repository;
- `automation/lockfiles` has not been observed;
- locked Rust tests/Clippy for the new dependency graph cannot honestly be claimed green yet.

The execution container used for this continuation cannot resolve GitHub DNS, so it cannot generate the exact lock from a clean local clone. Do **not** hand-construct transitive Cargo lock entries.

Required next action when a network-enabled runner is available:

```bash
cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

Commit the generated `src-tauri/Cargo.lock`, then re-run the full repository checks.

## Test coverage added/expanded in this continuation

Coverage now includes:

- Hindi catalog lookup;
- English default behavior;
- live catalog switching;
- active locale state;
- Hindi dynamic message helpers;
- `en-US`/`hi-IN` number grouping;
- persisted locale normalization;
- localized built-in presets;
- backup locale round trip;
- schema-v1 backups without locale;
- unsupported backup locale fallback;
- Settings language selector;
- live app Hindi switching;
- document `lang` metadata;
- localized probability presentation;
- localized roll result presentation;
- browser/Tauri runtime detection;
- browser export fallback;
- native save-command routing;
- native save cancellation;
- safe filename/format checks;
- native payload bounds;
- final selected-extension validation;
- safe localized History export feedback;
- safe localized backup export feedback;
- generated/adversarial Rust parser cases;
- coverage-guided parser fuzz entry point.

## Documentation state

The following current docs were updated or added during this continuation:

- `README.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `docs/localization.md`
- `docs/localization/HINDI_REVIEW.md`
- `docs/native-exports.md`
- `docs/testing.md`
- `docs/release.md`
- `src-tauri/fuzz/README.md`
- `what_changed.md`

## Current roadmap state

### Code-complete items

The roadmap now records as implemented:

- reviewed second locale;
- persisted English/Hindi preference;
- document-language metadata;
- locale-aware presentation formatting;
- native desktop save dialog route with browser fallback;
- parser fuzz target and scheduled/manual workflow;
- supporting unit/component/integration regression coverage.

### Evidence-gated open items

Still deliberately open:

- regenerate/commit Cargo lockfile for native dialog dependency;
- observe locked Rust test/Clippy on that dependency graph;
- observe full production real-browser E2E green on unrestricted infrastructure;
- observe a parser fuzz campaign green;
- record release-candidate benchmark evidence;
- clean-checkout verification;
- clean Windows/macOS/Linux candidate builds;
- native save-dialog smoke on each desktop platform;
- manual English/Hindi visual/accessibility review on candidate builds;
- real release screenshots;
- signing/notarization where credentials exist;
- dependency/CodeQL/repository-security review;
- manual keyboard/screen-reader smoke;
- artifact/provenance/checksum verification;
- draft release smoke checks;
- `v0.1.0` publication.

## Recent continuation commit ledger

Newest continuation commits include:

| Commit | Message |
| --- | --- |
| `73938697` | `docs: archive previous implementation handoff` |
| `0958ea05` | `docs: require lock refresh and native export release smoke` |
| `1b0054ac` | `docs: add native export locale and fuzz verification guidance` |
| `859fac6e` | `docs: update localization workflow for Hindi and Intl formatting` |
| `2637d357` | `docs: record locale aware presentation formatting` |
| `86be60fb` | `docs: record native exports and locale formatting` |
| `47adca9e` | `docs: separate native export completion from lock verification` |
| `df25cffc` | `test: cover localized roll result presentation` |
| `f4c28fb9` | `feat: localize roll result presentation` |
| `4548c4a5` | `feat: add locale aware time formatter` |
| `c0c1bd69` | `feat: localize history statistic formatting` |
| `c17ece11` | `ci: preserve generated lockfiles when main is protected` |
| `614e9da6` | `test: cover localized probability presentation` |
| `e7e5c091` | `feat: localize probability number formatting` |
| `d751e376` | `feat: format history timestamps with active locale` |
| `914bd653` | `test: cover locale aware formatting helpers` |
| `51c38f1d` | `feat: add locale aware number and date formatters` |
| `45601aaf` | `test: cover active locale state` |
| `ce3dda10` | `feat: expose active locale for formatting` |
| `57ab93af` | `docs: expose localization and native export features` |
| `dc14bb01` | `docs: define native export security boundary` |
| `9f221e5a` | `docs: document native export trust boundary` |
| `aef6ddae` | `ci: allow manual dependency lockfile refresh` |
| `c94bc0b0` | `test: cover browser and Tauri runtime detection` |
| `86291723` | `security: validate selected native export extension` |
| `556950a8` | `test: cover history export feedback` |
| `8190f82b` | `test: cover backup export status handling` |
| `b084fc53` | `test: cover browser and native export routing` |
| `e198ad3e` | `feat: surface backup export save status` |
| `f9ae29ae` | `feat: use native save flow for backup exports` |
| `c3a976d0` | `feat: add resilient history export feedback` |
| `ebed4fb6` | `feat: translate export status messages` |
| `1efd2c37` | `feat: add localized export status messages` |
| `0a75f0d1` | `feat: route desktop exports through native save dialog` |
| `76c65614` | `refactor: reuse shared runtime detection` |
| `cd045f03` | `refactor: centralize runtime detection` |
| `43cb4b07` | `feat: add native scoped export save command` |
| `ca3776c4` | `build: add native dialog dependency` |

The full earlier commit/history ledger remains in the archived handoff linked at the top of this file.

## Verification honesty

Repository tooling was used to inspect and modify the current GitHub state. The execution environment did not provide a network-enabled clean checkout capable of running Cargo dependency resolution, and the available GitHub connector did not expose an observed successful Actions run for the new dependency graph.

Therefore:

- code/config/test/docs changes are committed;
- configured CI/fuzz/lock workflows are documented;
- unobserved workflow success is **not** claimed;
- stale Cargo lock state is explicitly tracked as a blocker;
- release-only/manual evidence remains unchecked until observed on the intended candidate.

## Next continuation rule

Start with the first unresolved blocker rather than repeating completed work:

1. regenerate and commit `src-tauri/Cargo.lock` from the current manifest;
2. observe locked Rust test/Clippy;
3. run/observe the full quality/browser/fuzz checks;
4. perform platform-native export/localization smoke checks;
5. record benchmark/release-candidate evidence;
6. only then advance artifact/signing/screenshots/release publication.

Keep future meaningful changes granular and update this file as the handoff evolves.
