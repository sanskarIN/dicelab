# DiceLab — Development Handoff

_Last updated: 2026-08-19_

This file is the primary continuity and audit record for DiceLab. Read it together with the current repository tree, pull request #1, workflow results, and recent commits before changing the project in another session.

## Current milestone

- Project: **DiceLab**
- Repository: `https://github.com/sanskarIN/dicelab`
- Visibility: public
- Source model: open source
- License: MIT
- Source version: `0.1.0`
- Primary stack: Rust + Tauri 2 + TypeScript + React + Vite
- Targets: Windows, macOS, Linux, and web companion
- Default branch: `main`
- Audit branch: `audit/phase-6`
- Audit pull request: `#1 — chore: run phase 6 repository audit`
- Preferred commit email: `sanskarin@outlook.in`
- Visible product credit: **Made by the Sanskar**
- Current delivery state: **Phase 6 verification in progress; code/features are frozen except CI-driven fixes**

Do **not** tag `v0.1.0` until the exact final candidate has passed all required CI/security/build checks and release-candidate verification documented below.

## Repository starting point

The repository originally contained only the MIT `LICENSE`. DiceLab was implemented incrementally rather than replacing pre-existing working application code.

## Completed implementation

### Repository/toolchain foundation

Added and configured:

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vitest.config.ts`
- `eslint.config.js`
- `.prettierrc.json`
- `.editorconfig`
- `.gitattributes`
- `.gitignore`
- `.env.example`
- `index.html`
- `src/vite-env.d.ts`

The dependency-lock workflow generated and committed both `package-lock.json` and `src-tauri/Cargo.lock` on `main`, and that lockfile commit was merged into the audit branch.

### Dice expression/domain engine

Implemented:

- d4, d6, d8, d10, d12, d20, d100, and custom-sided dice;
- multiple dice per expression;
- signed modifiers;
- `khN` keep-highest;
- `klN` keep-lowest;
- `dhN` drop-highest;
- `dlN` drop-lowest;
- stable index-based tie handling;
- normalized expression formatting;
- shared public TypeScript limits via `DICE_LIMITS`;
- input bounds:
  - maximum 1,000 dice;
  - maximum 1,000,000 sides;
  - maximum modifier magnitude 1,000,000,000;
- user-safe validation errors through the locale catalog.

Relevant files:

- `src/domain/types.ts`
- `src/domain/parser.ts`
- `src/domain/engine.ts`
- `src/domain/random.ts`
- `src/domain/probability.ts`
- `src/domain/statistics.ts`

### Randomness modes

Implemented two intentionally separate modes:

- **Secure mode**
  - Tauri desktop: Rust `OsRng`;
  - web companion: Web Crypto with rejection sampling to avoid simple modulo bias.
- **Seeded mode**
  - deterministic TypeScript source for web testing/reproduction;
  - deterministic Rust `StdRng` seeded from a stable derived value for native use;
  - the configured seed is combined with a local roll sequence.

Seeded output is not described as cryptographically secure.

### Probability tools

Implemented:

- exact ordinary dice-sum distributions using dynamic programming;
- exact manageable keep/drop distributions using raw-outcome enumeration;
- expected value;
- minimum/maximum;
- per-total probability and ways;
- interactive complexity guards;
- UI output limiting so mathematically large distributions do not create an uncontrolled DOM tree.

### Roll history and statistics

Implemented:

- offline local history;
- configurable retention from 10 to 5,000 rolls;
- search/filter by expression or total;
- count, average, median, range;
- observed total frequencies;
- histogram;
- secure/seeded state indication;
- CSV export;
- JSON export;
- deliberate clear-history confirmation.

### Presets

Implemented built-in tabletop presets:

- D20 check;
- advantage;
- disadvantage;
- classic ability-score roll;
- fireball multi-die preset;
- percentile roll.

Also implemented:

- custom preset creation;
- custom preset deletion;
- versioned local persistence;
- validation of persisted custom presets before loading.

### Backup/export and restore

Implemented backup schema version `1` with:

- export timestamp;
- roll history;
- custom presets;
- settings.

Backup import validates untrusted files before replacing application state. Current checks include:

- maximum 5 MB JSON input;
- schema version;
- maximum 5,000 history records;
- maximum 500 custom presets;
- roll IDs and field types;
- normalized expressions;
- modifier consistency;
- exact die count;
- die values within the expression side range;
- unique/in-range die indices;
- keep/drop flags recomputed from the expression and dice values;
- recomputed roll total equality;
- timestamp validity;
- random-mode validity;
- seed length;
- preset IDs/names/descriptions/date/expression validity;
- settings theme/random mode/retention/seed normalization.

Built-in presets are re-created by the application and are never trusted from backup input.

CSV export additionally neutralizes user-controlled seed values beginning with `=`, `+`, `-`, or `@` before the cell is opened by spreadsheet software.

Relevant files:

- `src/services/export.ts`
- `src/services/backup.test.ts`
- `src/services/export.test.ts`

### Corrupted local-state recovery

Local storage is treated as untrusted persisted input rather than assumed valid.

Implemented:

- shared roll/preset integrity validators reused by backup import and local persistence;
- invalid/corrupted history entries are filtered on load;
- invalid custom presets are filtered on load;
- duplicate/built-in spoofed custom preset IDs are not accepted as custom entries;
- invalid persisted theme/random mode values fall back to defaults;
- history limit is clamped to supported bounds;
- seed text is bounded;
- invalid boolean preference types fall back to defaults;
- storage exceptions degrade to in-memory operation instead of blocking rolls.

Relevant files:

- `src/services/storage.ts`
- `src/services/storage.test.ts`
- `src/services/export.ts`

### Native Tauri application

Implemented:

- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/build.rs`
- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/icons/icon.png`

The native `roll_expression` command:

1. validates the expression again at the Rust trust boundary;
2. enforces the same dice/sides/modifier/selection safety bounds;
3. performs native secure or deterministic rolling;
4. returns normalized result data;
5. returns stable machine-readable error codes instead of English UI messages.

Native codes currently include:

- `ERR_INVALID_EXPRESSION`
- `ERR_DICE_COUNT`
- `ERR_SIDES`
- `ERR_MODIFIER`
- `ERR_SELECTION_COUNT`
- `ERR_KEEP_COUNT`
- `ERR_DROP_COUNT`
- `ERR_RANDOM_MODE`

`src/services/roll-service.ts` converts these codes into catalog-backed messages. Raw native codes are not intended as normal user-facing copy.

### Native security configuration

Implemented:

- restrictive production CSP;
- separate development CSP;
- minimal Tauri `core:default` capability for the main window;
- no broad shell permission;
- no broad filesystem permission;
- no required remote application API;
- no production credential requirement for core operation.

### User interface

Implemented a complete responsive product interface:

- desktop sidebar navigation;
- compact mobile/web bottom navigation;
- first-run onboarding;
- roll studio;
- standard quick-dice controls;
- custom expression editor;
- immediate validation;
- secure/seeded status pill;
- individual kept/dropped die presentation;
- presets;
- history/statistics/histogram;
- probability calculator;
- Settings;
- About;
- command palette;
- backup import/export;
- CSV/JSON export;
- local data reset.

Primary files:

- `src/App.tsx`
- `src/main.tsx`
- `src/styles.css`
- `src/components/AppShell.tsx`
- `src/components/RollWorkspace.tsx`
- `src/components/HistoryPanel.tsx`
- `src/components/ProbabilityPanel.tsx`
- `src/components/SettingsPanel.tsx`
- `src/components/AboutPanel.tsx`
- `src/components/CommandPalette.tsx`
- `src/components/Onboarding.tsx`

### Accessibility baseline

Implemented:

- semantic native controls;
- labels for inputs/selects/checkboxes;
- visible focus styles;
- skip-to-content link;
- `aria-current` for active navigation;
- dialog labeling;
- error/status live regions where appropriate;
- dropped dice communicated by more than color;
- touch-friendly responsive controls;
- reduced-motion setting;
- separate dice-animation setting;
- CSS support for `prefers-reduced-motion`;
- keyboard command palette (`Ctrl/Cmd + K`, Escape);
- component smoke tests for onboarding dialog semantics/activation and Settings control labeling.

Manual screen-reader/keyboard release review is still a release-candidate task and must not be claimed complete solely from automated tests.

### Themes/UI design system

Implemented:

- light theme;
- dark theme;
- system-following theme;
- spacing/radii/border/elevation tokens;
- responsive breakpoints;
- consistent panels/buttons/inputs;
- loading/busy roll state;
- empty states;
- error states;
- status presentation;
- reduced-motion behavior;
- professional app icon and About branding.

### Internationalization-ready architecture

Implemented an externalized English product catalog:

- `src/i18n/en.ts`
- `src/i18n/index.ts`

Catalog-backed copy is used by:

- application shell;
- navigation;
- onboarding;
- roll workspace;
- history/statistics;
- probability calculator;
- settings;
- About/support;
- command palette;
- built-in presets;
- TypeScript domain validation;
- backup validation;
- native error-code translation.

The first additional translated locale is not included yet because a reviewed translation is required before claiming another supported language. The architecture no longer requires rewriting component/business logic to add it.

Stable machine contracts such as exported CSV field names, filenames, and internal developer diagnostics are intentionally not treated as translated UI strings.

### Structured privacy-safe logging

Implemented `src/services/logger.ts` with:

- structured JSON event records;
- bounded event/value lengths;
- sensitive-key redaction for keys matching authorization, cookie, email, password, secret, seed, token, credential, or key;
- production suppression of debug events;
- error logging that records the error type but intentionally omits exception messages that may contain user-controlled data.

Integrated events include backup export/restore, restore failure, local-data clear, and roll failure metadata without logging dice expressions or seed values.

### Privacy/offline behavior

Core workflows require no account or remote database:

- dice rolling;
- history;
- presets;
- probability;
- settings;
- backup;
- exports.

No analytics SDK, advertising SDK, or donation gate was added.

### Contact/support/funding

Project documentation and About UI include appropriate references to:

- `sanskarin@outlook.in`
- `sanskarin.business@gmail.com`
- `supportramsandesh@gmail.com`
- `https://github.com/sanskarIN`
- `https://github.com/sanskarIN/dicelab`
- `https://buymeacoffee.com/sanskarIN`

README includes a visible Buy Me a Coffee badge. Funding remains optional.

## Automated tests added

### TypeScript/Vitest domain tests

`src/domain/parser.test.ts`

- normal expression normalization;
- omitted dice count;
- custom side count;
- keep/drop operations;
- invalid count/sides/selection/text rejection.

`src/domain/engine.test.ts`

- keep-highest selection with modifier;
- deterministic seeded sequence reproduction;
- generated range invariants.

`src/domain/probability.test.ts`

- exact classic `2d6` distribution;
- exact `2d20kh1` distribution;
- exact `4d6kh3` limits/outcome count;
- interactive complexity rejection.

### TypeScript/Vitest service tests

`src/services/export.test.ts`

- JSON serialization;
- CSV serialization/escaping;
- spreadsheet formula neutralization for user-controlled seed cells.

`src/services/backup.test.ts`

- valid backup round trip;
- unsupported schema rejection;
- invalid expression rejection;
- inconsistent roll-total rejection;
- out-of-range die rejection;
- inconsistent keep/drop flag rejection.

`src/services/storage.test.ts`

- corrupted history filtering;
- corrupted custom-preset filtering while built-ins remain;
- invalid settings normalization/clamping.

`src/services/logger.test.ts`

- sensitive-key redaction;
- safe context retention;
- exception-message omission.

`src/services/roll-service.test.ts`

- direct native string error-code extraction;
- `Error` message code extraction;
- message-bearing object normalization;
- arbitrary-object data is not serialized/exposed.

### Component smoke tests

`src/components/Onboarding.test.tsx`

- labeled modal semantics;
- `aria-modal`;
- focusable/keyboard-operable completion button.

`src/components/SettingsPanel.test.tsx`

- accessible native theme control;
- setting change callback;
- reduced-motion checkbox exposure;
- backup export button exposure.

### Rust tests

Embedded in `src-tauri/src/lib.rs`:

- valid keep-highest expression parsing;
- stable native error codes;
- invalid count/sides/keep/drop cases;
- extreme negative modifier rejection without overflow;
- keep-highest selection behavior;
- deterministic seeded roll reproduction.

## Bugs/security issues fixed during implementation

### Native modifier overflow edge case

An earlier Rust bound check used `modifier.abs()`. `i64::MIN.abs()` can overflow. It was replaced with an inclusive signed range check and a regression test for:

```text
1d6-9223372036854775808
```

### Lockfile automation race

The initial generated-lockfile workflow could fail to push if `main` advanced during its run. It now rebases from `origin/main` before pushing.

### CI before initial lockfiles

The first Rust CI design always requested `--locked`, which is invalid before the first `Cargo.lock` exists. CI now uses locked resolution when the lockfile exists while still allowing the one-time bootstrap state.

### Backup integrity hardening

Backup validation originally checked broad object shape but not every relationship among expression/dice/keep flags/total. It now recomputes those relationships before restore.

### CSV spreadsheet interpretation

User-controlled seeded text could begin with formula prefixes in a CSV export. Such seed values are now neutralized before CSV serialization.

### Corrupted local persistence

Local storage originally used lighter shape checks. It now shares the stricter persisted-data validators and safely normalizes settings.

### Native localization boundary

Rust originally returned English error strings. It now returns stable machine codes and TypeScript maps them to the active product catalog.

## Documentation set

Created/maintained:

- `README.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `PRIVACY.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`
- `docs/architecture.md`
- `docs/setup.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `docs/repository-settings.md`
- `docs/adr/README.md`
- `docs/adr/0001-modular-monolith.md`
- `docs/adr/0002-randomness-modes.md`
- `docs/adr/0003-local-persistence.md`

README intentionally does **not** present fake/mock screenshots as real shipping captures. Real screenshots remain a release-candidate task.

## GitHub repository quality configuration

Added:

- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/pull_request_template.md`
- `.github/dependabot.yml`
- `.github/FUNDING.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/lockfiles.yml`
- `.github/workflows/release.yml`
- `.github/workflows/audit-format.yml` on the audit branch only, to normalize TypeScript/JSON/Markdown/YAML and Rust formatting before final verification.

`docs/repository-settings.md` documents branch protection/rulesets, Discussions categories, labels, milestones, Actions permissions, repository security settings, releases, and funding guidance for settings not fully representable by repository files.

## Lockfile state

Completed:

- `package-lock.json` exists and uses lockfile version 3.
- `src-tauri/Cargo.lock` was generated in the same lockfile automation commit.
- Main lockfile commit: `f499161b0ddb8bbf82532e2ec4967a7fa9bca21f` — `build: lock application dependencies`.
- Audit branch synced this main commit through merge commit `f5dcc9917325aab81f9e2791981f3fdb00350f2d`.

## Verification performed outside GitHub Actions

The available local execution container was inspected:

- Node.js: `v22.16.0`
- npm: `10.9.2`
- global TypeScript: `5.8.3`
- Rust/Cargo: not installed in that container
- project npm dependencies: not preinstalled
- external package/GitHub downloads: blocked by DNS/network restrictions in that container

Therefore no local claim is made that npm install, Prettier, ESLint, Vitest, Vite production build, Cargo tests, Clippy, or desktop packaging passed in that restricted local environment.

GitHub Actions is the authoritative network-enabled verification path for this audit.

## GitHub Actions audit history

An earlier audit-branch CI run proved that the Rust formatting stage could execute successfully on the GitHub runner. That run became obsolete when additional hardening commits changed the branch and must not be treated as the final candidate result.

Current branch changes are now frozen except for:

1. automated formatting generated by the branch-only audit formatter;
2. defects discovered by the final CI/CodeQL runs;
3. final audit-record documentation updates.

Final workflow IDs/conclusions must be recorded here after the formatter-generated commit (if any) becomes the PR head and CI/CodeQL finish.

## Current known release blockers

The following are explicitly **not** claimed complete yet:

1. Final PR-head Prettier check.
2. Final PR-head ESLint check.
3. Final PR-head TypeScript/Vite production build.
4. Final PR-head Vitest suite.
5. Final PR-head Rust format check.
6. Final PR-head Rust tests.
7. Final PR-head Clippy with warnings denied.
8. Final PR-head CodeQL result.
9. Windows/macOS/Linux release-bundle verification for the exact release candidate.
10. Real release-candidate screenshots.
11. Manual keyboard/screen-reader release review.
12. Documentation-link audit.
13. Signed/notarized desktop artifacts where credentials are available.
14. Repository-level branch protection/ruleset is not configurable through the currently exposed connector action set and must be enabled using `docs/repository-settings.md` after stable required-check names are confirmed.

These are release-gate items, not hidden defects.

## Phase status

### Phase 0 — Foundation

Implementation complete; final verification tied to Phase 6.

### Phase 1 — End-to-end MVP

Implementation complete; final verification tied to Phase 6.

### Phase 2 — Complete core feature set

Implementation complete, including validated backup restore.

### Phase 3 — Hardening and advanced UX

Implemented for the current product scope:

- CSP/minimal capabilities;
- reduced motion;
- responsive layouts;
- structured redacted logging;
- corrupted-state recovery;
- CSV formula neutralization;
- externalized English catalog;
- locale-neutral native error contract.

Additional translated languages and optional native save-dialog integration remain future enhancements, not requirements for core offline DiceLab correctness.

### Phase 4 — Automated verification depth

Implemented domain/service/native/component smoke tests listed above. Browser E2E, dedicated fuzzing, and formal performance benchmark harnesses remain follow-up quality depth and must not be represented as already shipped.

### Phase 5 — Release engineering

Implemented:

- lockfiles;
- release documentation;
- cross-platform tag build workflow;
- CodeQL;
- Dependabot;
- funding/repository templates.

Release-candidate bundles/screenshots/signing verification remain pending.

### Phase 6 — Final audit

In progress through PR #1.

## Exact next tasks

Continue in this exact order:

1. Allow `.github/workflows/audit-format.yml` to create `style: normalize repository formatting` if Prettier/rustfmt changes are needed.
2. Confirm the audit PR head after formatting.
3. Inspect CI and CodeQL runs for that exact head SHA.
4. Fetch failed job logs and fix every real formatting/lint/type/test/build/Rust/Clippy/security defect with small regression-oriented commits.
5. Repeat until final PR-head CI and CodeQL checks are successful.
6. Update this file with exact final workflow run IDs, job names, conclusions, and any fixes made during CI.
7. Re-run/check CI after the final documentation-only handoff update if the PR head changes.
8. Merge PR #1 using a normal merge commit rather than squash so the meaningful atomic history is preserved.
9. Verify the merged `main` commit/workflow state.
10. Run/verify Windows, macOS, and Linux release-candidate bundles before tagging.
11. Capture real release-candidate screenshots and replace the README screenshot placeholder section with actual captures.
12. Complete the manual accessibility/documentation-link release checklist.
13. Enable repository branch protection/ruleset using the stable check names documented in `docs/repository-settings.md` when repository settings access is available.
14. Only after the full release gate passes, prepare/tag `v0.1.0` and publish release notes/artifacts.

## Migration notes

- Runtime local-storage schema remains `v1`.
- Backup schema remains version `1`.
- Current changes do not require a user data migration.
- Future incompatible local-storage changes must introduce a migration or new versioned key.
- Future backup schema versions must explicitly validate and migrate known earlier versions.
- Unknown backup schema versions must be rejected rather than silently reinterpreted.
- Built-in presets remain application-owned and are never restored from external backup data.

## Draft release notes — 0.1.0

### Dice rolling

- standard and custom dice;
- pools, modifiers, keep/drop expressions;
- native secure random mode;
- deterministic seeded mode.

### History and probability

- local history;
- filters/statistics/histogram;
- CSV/JSON exports;
- exact common-expression probability distributions with complexity guards.

### Presets and data

- built-in tabletop presets;
- custom presets;
- versioned local persistence;
- validated JSON backup export/restore;
- corrupted-state recovery.

### Experience

- responsive desktop/web UI;
- light/dark/system themes;
- reduced motion/non-animation controls;
- command palette;
- first-run onboarding;
- externalized English catalog;
- About/support/privacy surfaces.

### Security/privacy

- offline-first core product with no required account;
- restrictive Tauri CSP;
- minimal Tauri permissions;
- bounded validation at TypeScript and Rust trust boundaries;
- stable native error codes;
- validated backup integrity;
- spreadsheet-safe seed export;
- privacy-safe structured logs;
- responsible disclosure documentation;
- CodeQL and dependency maintenance automation.

Do not publish these notes as final until the release gate above is complete.

## Important recent commits/checkpoints

Known meaningful checkpoints include:

- `f499161b0ddb8bbf82532e2ec4967a7fa9bca21f` — `build: lock application dependencies`
- `f5dcc9917325aab81f9e2791981f3fdb00350f2d` — `chore: sync dependency lockfiles into audit branch`
- `b378fc6ffdcc55e65919906fb26ae5d0f0be4f01` — `ci: autoformat phase 6 audit branch`
- later audit commits add Rust native error codes, localized native-error mapping, structured logging/tests, backup/CSV hardening, local-persistence validation/tests, externalized catalog migration, component smoke tests, repository-settings guidance, and updated architecture/testing/roadmap/changelog documentation.

Use GitHub recent-commit history for exact hashes of those later atomic commits before preparing a release.

## Continuation rule

Do not restart or replace the project. Continue from the exact audit state above, allow only verification-driven fixes until PR #1 is green, keep commits atomic and meaningful, and update this file again before ending another development session.

**Made by the Sanskar**
