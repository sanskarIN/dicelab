# DiceLab — Work Handoff

## Current milestone

Phase 4 verification/hardening is substantially implemented in code and automated tests. Phase 5 release engineering is also substantially implemented, including locked dependency checks, tagged cross-platform builds, draft GitHub release packaging, and checksums.

The project must **not** be called fully complete yet because the current environment cannot observe a clean full repository CI run or install/smoke-test the generated Windows/macOS/Linux release artifacts. Phase 6 remains an evidence/verification milestone rather than a code-completeness claim.

## Repository identity

- Repository: `sanskarIN/dicelab`
- Default branch: `main`
- Visibility: public
- License: MIT
- Stack: Rust + Tauri 2 + TypeScript + React + Vite
- Web companion: supported
- Desktop targets: Windows, macOS, Linux
- Product credit: **Made by the Sanskar**
- Preferred Git author email: `sanskarin@outlook.in`
- Current version: `0.1.0`
- Version values were inspected and are aligned in `package.json`, `src/config/app.ts`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`.

## Continuation baseline

This continuation started after the previous Phase 4 handoff had already delivered:

- spreadsheet-formula-safe CSV export;
- stricter backup record validation;
- statistics and deterministic RNG tests;
- documentation of the initial import/export hardening.

The previous baseline commit referenced by the prior handoff was `1d891d0fc7f552e6c9da86b343c9b8a9842b14c3` — `docs: record import and export hardening`.

## Completed work in this continuation

### 1. Browser integration coverage

Added application-level integration coverage with Testing Library for important offline workflows:

- seeded roll → visible result → History;
- History statistics after rolling;
- CSV export invocation;
- valid backup restore through Settings;
- restored history visibility;
- Settings → About navigation.

Shared jsdom/browser test setup now supplies stable `matchMedia`, animation-frame, and object-URL behavior without introducing fake production code paths.

### 2. Persistence trust-boundary hardening

Added `src/domain/persistence.ts` as the shared runtime-validation boundary for persisted data.

Persisted roll validation now checks:

- non-empty/bounded IDs;
- valid dice expressions;
- safe-integer totals and modifiers;
- die-count consistency with the parsed expression;
- die values within the expression side range;
- bounded, unique die indices;
- correct keep/drop retained count;
- computed total consistency;
- canonical ISO timestamps;
- valid random mode;
- deterministic seed presence when required;
- bounded stored effective seed length.

Persisted preset validation now checks IDs, names, expressions, descriptions, and canonical timestamps.

Local-storage recovery now:

- treats stored JSON as untrusted input;
- safely falls back when JSON is malformed;
- bounds history/custom-preset counts;
- filters malformed records;
- deduplicates record IDs;
- ignores forged entries using reserved built-in preset IDs;
- normalizes invalid settings;
- forces animations off when reduced motion is enabled;
- remains usable when browser storage is blocked or full.

### 3. Backup restore integrity hardening

Backup schema remains version `1`, but restore validation is stricter.

Backup import now rejects:

- malformed history/preset records;
- inconsistent totals/modifiers/dice counts;
- impossible die values;
- duplicate or out-of-range die indices;
- invalid keep/drop state;
- missing deterministic seeds;
- malformed canonical timestamps;
- duplicate roll IDs;
- duplicate preset IDs;
- malformed explicit export timestamps;
- oversized histories/preset sets/files.

A compatibility defect was found and fixed: a maximum-length 120-character configured seed receives a per-roll sequence suffix, so stored effective roll seeds can legitimately exceed 120 characters. Imported stored effective seeds now allow a safe bounded length of 200 while configured settings remain capped at 120.

Imported settings also normalize reduced-motion/animation contradictions.

### 4. Cross-runtime deterministic RNG parity

Fixed a major reproducibility defect: web and Rust desktop seeded modes previously used different deterministic algorithms, so identical seeds could produce different sequences.

Both runtimes now use the same explicitly documented algorithm:

- UTF-8 FNV-1a 32-bit seed hash;
- xorshift32 state transition;
- identical bounded integer conversion;
- identical effective-seed behavior.

TypeScript and Rust tests pin matching reference vectors, including Unicode hashing, so future algorithm drift becomes a visible compatibility failure.

Secure mode remains separate:

- desktop secure mode: Rust `OsRng`;
- browser secure mode: Web Crypto bounded generation.

Seeded mode remains explicitly non-cryptographic.

### 5. Exact probability numeric correctness

The ordinary-sum probability engine previously could label a result `exact: true` even when the raw number of outcomes exceeded JavaScript safe-integer precision.

The engine now rejects ordinary-sum expressions whose raw outcome count cannot be represented as a safe integer while preserving exact integer `ways` counts.

Regression coverage includes:

- `20d6` exact safe-integer behavior;
- `21d6` rejection through `ProbabilityComplexityError`;
- expected-value consistency;
- existing keep/drop complexity limits.

### 6. Modal and onboarding accessibility

Command palette now:

- focuses its search field on open;
- traps Tab/Shift+Tab within the dialog;
- closes with Escape;
- restores focus to the invoking element on close;
- retains Enter activation of the first filtered command.

Onboarding now:

- has an accessible description;
- has modal semantics;
- moves initial focus to the primary “Start rolling” action.

Regression tests cover these keyboard/focus behaviors.

### 7. Settings/About product completeness

Added centralized product metadata in `src/config/app.ts` for:

- app name/version/credit;
- repository URL;
- releases URL;
- privacy URL;
- BMC URL;
- business/support emails.

Settings now contains a real **Updates & About** section with:

- installed version;
- releases link;
- direct About navigation.

About reuses centralized metadata so contact/version/project information cannot drift independently.

Settings tests cover reduced-motion behavior, version/releases visibility, and About action wiring.

### 8. Internationalization-ready architecture

Added a typed English message-catalog boundary without introducing a runtime translation dependency.

New architecture:

- `src/i18n/en.ts` — English catalog;
- `src/i18n/index.ts` — supported-locale boundary;
- `MessageCatalog` — widened structural catalog type for future locales;
- dynamic messages represented as typed functions where sentence structure depends on values.

Migrated user-facing copy from the main React surfaces into the catalog:

- application-level skip/error/custom-preset strings;
- desktop/mobile navigation;
- onboarding;
- command palette;
- roll workspace;
- history;
- probability;
- settings;
- About;
- built-in preset names/descriptions;
- user-facing accessibility labels and dynamic notices;
- application recovery/fatal-interface messages.

Added `docs/localization.md` with the exact second-locale workflow and catalog requirements.

English remains the only shipped locale, which matches the master requirement to ship English first while keeping strings externalized. No fake language selector was added before a second complete locale exists.

### 9. Generated parser invariants

Expanded parser tests with 500 deterministic generated valid expressions to verify normalization idempotence.

Also added case/whitespace-equivalence checks so equivalent input forms normalize to identical domain values.

This provides property-style coverage without adding a new dependency or nondeterministic CI behavior.

### 10. Large-history rendering performance

History retention remains capped at 5,000 records, but the UI no longer mounts every matching row immediately.

History now:

- renders the first 200 matching roll rows;
- reveals additional rows in explicit 200-entry increments;
- resets the visible window when filtering changes;
- still calculates statistics/histograms across the complete filtered set;
- still exports the complete filtered set rather than only visible rows.

Regression tests verify a 220-entry history renders 200 rows first, then all 220 after “Show more rolls,” while summary statistics remain complete.

### 11. Release workflow hardening

Tagged release workflow now:

1. verifies frontend dependencies with `npm ci`;
2. runs documentation-link audit, format, lint, tests, and production web build;
3. verifies Rust formatting, locked tests, and locked Clippy checks;
4. builds Tauri artifacts on Windows, macOS, and Linux;
5. uploads successful workflow artifacts;
6. downloads only artifacts from successful prerequisite jobs;
7. packages each artifact set into ZIP files;
8. creates `SHA256SUMS.txt`;
9. creates/updates a **draft** GitHub release;
10. uploads packages/checksums to the draft.

The release deliberately remains a draft until a maintainer performs real artifact installation/smoke testing. Signing/notarization is not falsely claimed when credentials are unavailable.

### 12. Main CI reproducibility

Main CI now uses:

- `npm ci` only;
- committed npm lockfile;
- Cargo `--locked` tests/Clippy;
- documentation-link audit;
- format check;
- lint;
- unit/integration tests;
- production TypeScript/Vite build;
- Rust format/test/Clippy quality gates.

Fallback installation behavior that could hide lockfile drift was removed.

### 13. Documentation-link audit

Added dependency-free `scripts/check-doc-links.mjs` and exposed:

```bash
npm run docs:check
```

It scans repository Markdown files and fails on missing relative targets or malformed percent-encoding while intentionally leaving external URL reachability to network-enabled release review.

The check is wired into normal CI and the tagged release workflow.

### 14. Documentation consistency

Updated documentation to match the real implementation:

- README now reflects seeded parity, persistence hardening, progressive history, typed i18n, exactness guards, quality commands, and draft-release/checksum workflow;
- architecture docs now describe `config/`, `i18n/`, persistence validation, backup trust boundaries, and cross-runtime seeded compatibility;
- testing docs now list integration, storage, i18n, parser-invariant, accessibility, progressive-history, and root-recovery coverage;
- accessibility docs now document modal focus guarantees and reduced-motion normalization;
- performance docs now describe progressive history rendering and numeric exactness safeguards;
- release docs now document version locations, clean-checkout commands, checksum review, draft publication, and artifact smoke tests;
- security docs now document persistence/backup/CSV/release trust boundaries;
- contributing/development docs now use locked commands, i18n rules, docs checks, seeded parity rules, and the preferred commit email;
- roadmap/changelog now distinguish implemented work from external verification still required.

A repository-tree typo introduced during the development-guide edit was detected in the same pass and corrected immediately in a separate `fix:` commit.

### 15. Application-level render recovery

Added a root React error boundary so an unexpected render failure no longer leaves DiceLab with an unhandled blank interface.

The recovery boundary:

- wraps the entire `<App />` at the React root;
- shows a localized recovery surface with `role="alert"`;
- tells the user that DiceLab local data has not been cleared;
- provides an explicit reload action;
- logs only a fixed DiceLab recovery event from the boundary rather than serializing raw exception contents into the project’s own logging call.

Regression tests verify healthy children render normally and a synthetic render failure is replaced by the recovery UI.

## Files added in this continuation

- `src/App.integration.test.tsx`
- `src/config/app.ts`
- `src/domain/persistence.ts`
- `src/i18n/en.ts`
- `src/i18n/index.ts`
- `src/i18n/index.test.ts`
- `src/services/storage.test.ts`
- `src/components/AppErrorBoundary.tsx`
- `src/components/AppErrorBoundary.test.tsx`
- `src/components/CommandPalette.test.tsx`
- `src/components/Onboarding.test.tsx`
- `src/components/SettingsPanel.test.tsx`
- `src/components/HistoryPanel.test.tsx`
- `docs/localization.md`
- `scripts/check-doc-links.mjs`

## Existing files changed in this continuation

- `src/test/setup.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/domain/parser.test.ts`
- `src/domain/probability.ts`
- `src/domain/probability.test.ts`
- `src/domain/random.test.ts`
- `src/services/export.ts`
- `src/services/backup.test.ts`
- `src/services/storage.ts`
- `src/components/AppShell.tsx`
- `src/components/AboutPanel.tsx`
- `src/components/CommandPalette.tsx`
- `src/components/HistoryPanel.tsx`
- `src/components/Onboarding.tsx`
- `src/components/ProbabilityPanel.tsx`
- `src/components/RollWorkspace.tsx`
- `src/components/SettingsPanel.tsx`
- `src-tauri/src/lib.rs`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `package.json`
- `README.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `SECURITY.md`
- `CONTRIBUTING.md`
- `docs/architecture.md`
- `docs/adr/0002-randomness-modes.md`
- `docs/accessibility.md`
- `docs/development.md`
- `docs/performance.md`
- `docs/release.md`
- `docs/testing.md`
- `what_changed.md`

## Tests added or expanded

- full app integration: seeded roll → History → CSV export;
- full app integration: backup restore → History;
- full app integration: Settings → About;
- local-storage malformed JSON recovery;
- local-storage settings normalization;
- malformed persisted roll filtering;
- forged built-in preset filtering;
- persistence deduplication on load/write;
- backup maximum-length configured-seed round trip;
- backup duplicate roll IDs;
- backup duplicate preset IDs;
- backup malformed export timestamp;
- backup reduced-motion normalization;
- command-palette focus entry/trap/restore/Escape;
- command-palette filtering + Enter activation;
- onboarding dialog accessibility and initial focus;
- Settings reduced-motion invariant;
- Settings releases/About actions;
- TypeScript/Rust deterministic RNG cross-runtime vectors;
- Unicode seed-hash compatibility vectors;
- probability safe-integer exactness boundary;
- generated parser normalization invariants;
- parser case/whitespace equivalence;
- locale catalog default/dynamic-message behavior;
- progressive history rendering and filter-window reset;
- application root error recovery boundary.

## Verification/checks performed in this continuation

### Repository/API checks

- GitHub repository metadata lookup: succeeded.
- GitHub repository tree/file inspection: succeeded.
- GitHub commit-history inspection: succeeded.
- Authenticated GitHub connector retains push/admin access.
- Current version locations were inspected and are aligned at `0.1.0`.

### GitHub status visibility

The connector’s combined-status endpoint returned an empty status list for the checked current commits, including `bc08b04cdd0dc80c1b83611f34461bd6b332defe` before the final recovery-boundary commits.

This means **CI is not being claimed green** from this environment. An empty connector response is treated as “status not observable,” not as a passing result. Re-check the final handoff commit in the next continuation or through the GitHub Actions UI.

### Local isolated verification

The repository could not be cloned into the execution sandbox because outbound DNS access to `github.com` is unavailable. Therefore a full repository `npm ci`/Cargo build was not run locally.

Two isolated checks were still performed using the exact implementation patterns committed:

1. `scripts/check-doc-links.mjs`
   - `node --check` passed;
   - synthetic Markdown repository smoke test passed and correctly resolved relative/external link handling.
2. `MessageCatalog` TypeScript widening pattern
   - compiled with global TypeScript `5.8.3` using `tsc --noEmit --strict --target ES2022` against a representative second-locale structure;
   - validated that translated string literals can satisfy the widened catalog type while preserving dynamic-function parameter types.

These are narrow implementation checks, **not substitutes** for the repository CI suite.

## Git author email limitation

The GitHub connector’s file create/update functions allow commit messages but do not expose commit author/email fields. Therefore the requested `sanskarin@outlook.in` cannot be forced on connector-generated commits.

The repository itself documents the preferred email and `src-tauri/Cargo.toml` already includes:

```text
Sanskar <sanskarin@outlook.in>
```

When committing through normal Git, use:

```bash
git config user.email sanskarin@outlook.in
```

## Known limitations / external blockers

These are intentionally not hidden or marked complete:

1. Full clean-checkout `npm ci`, `npm run docs:check`, format, lint, Vitest, TypeScript/Vite build, Cargo format/test/Clippy have not been observed green for the latest commit from this environment.
2. Windows, macOS, and Linux Tauri release artifacts have not been installed/smoke-tested here.
3. Real release-candidate screenshots have not been captured; README intentionally describes the views instead of using fabricated screenshots.
4. Signing/notarization credentials are not available through this session; the project does not claim signed/notarized artifacts.
5. Real-browser E2E coverage is still pending. Current integration tests use jsdom/Testing Library.
6. Dedicated Rust fuzz infrastructure is still pending.
7. Executable wall-clock performance benchmarks are still pending; performance-oriented behavior is covered by deterministic regression tests and documented budgets.
8. A second locale is intentionally not shipped yet. The typed English catalog and contributor contract are ready for one.
9. Manual keyboard + screen-reader review on actual release artifacts is still required before Phase 6 can be closed.
10. External URL reachability still requires a network-enabled release audit; `docs:check` validates repository-relative Markdown targets only.

## Next exact tasks

Resume in this order:

1. Obtain/observe a clean network-enabled CI run on latest `main` and fix every format/lint/type/test/Rust/docs failure reported. Do not mark Phase 6 complete from an empty status response.
2. Run the tagged release workflow on a release-candidate tag only after normal CI is green; keep the generated GitHub release as a draft.
3. Download each draft artifact package, verify it against `SHA256SUMS.txt`, and install/smoke-test Windows, macOS, and Linux builds.
4. Capture **real** screenshots from the verified release candidate and replace the README screenshot-description table only when genuine captures exist.
5. Add a real-browser E2E suite for onboarding → roll → history, persistence across reload, actual file download/import, probability calculation, command palette, keyboard behavior, and controlled recovery-page reload behavior.
6. Add executable benchmarks for parser, probability, 5,000-record search/statistics, progressive rendering, and Rust roll throughput with documented machine/runtime metadata.
7. Add a dedicated Rust parser fuzz target if the chosen fuzz tooling can be introduced with generated lockfile changes from a network-enabled environment.
8. Migrate remaining translatable parser/domain error prose to stable error codes before shipping a second locale.
9. Add and review a complete second locale, then expose locale selection/persistence only after catalog completeness and layout/accessibility review.
10. Run a network-enabled external-link audit, secret/dependency/CodeQL review, manual keyboard/screen-reader smoke pass, and final release-candidate checklist.
11. Update `CHANGELOG.md`, `ROADMAP.md`, `README.md`, `docs/release.md`, and this file with actual CI/artifact evidence before publishing `v0.1.0`.

## Migration notes

- No local-storage key migration is required by this continuation.
- Backup schema remains `1`.
- Backup validation is stricter; malformed/ambiguous schema-1 backups may now be rejected instead of silently loading inconsistent state.
- Seeded deterministic output is now intentionally standardized across TypeScript and Rust. Any future seeded-algorithm change is a compatibility change and must update both reference-vector suites plus release notes.
- No database migration exists because DiceLab still intentionally uses bounded local storage for its current data model.
- The root error boundary does not clear, rewrite, or migrate local user data.

## Release notes draft

### Unreleased — Added

- Browser-level integration coverage for primary offline workflows.
- Runtime persistence validation and corrupted-storage recovery.
- Typed English locale catalog and localization contributor architecture.
- Progressive rendering for large roll histories.
- Settings version/releases/About surface.
- Documentation-link audit in CI/release workflows.
- Draft-release ZIP/checksum packaging.
- Cross-runtime seeded RNG reference-vector coverage.
- Localized root application recovery surface for unexpected React render failures.

### Unreleased — Changed

- Web and Rust seeded mode now share one deterministic algorithm for portable reproduction.
- Probability results advertised as exact now refuse unsafe integer-outcome ranges.
- Main CI/release checks use committed lockfiles and locked package-manager behavior.
- Backup/local-persistence handling now treats stored data as untrusted runtime input.
- User-facing React/preset/recovery copy is externalized through the English message catalog.

### Unreleased — Fixed

- Maximum-length configured deterministic seeds now survive backup round trips after sequence suffixes are appended.
- Duplicate/ambiguous backup identifiers are rejected.
- Reduced-motion state cannot restore with contradictory animations enabled.
- Command-palette focus no longer escapes the modal and returns to the trigger when closed.
- Large histories no longer mount all retained rows immediately.
- Unexpected React render failures now show a recovery action instead of leaving an unhandled blank UI.

### Unreleased — Security

- Backup restore integrity validation was expanded substantially.
- Corrupted local persistence is filtered/normalized before use.
- Existing spreadsheet-safe CSV export remains enforced.
- Draft releases are generated only after prerequisite jobs and include SHA-256 checksum metadata.
- The DiceLab error boundary records only a fixed redacted recovery event instead of logging raw exception contents from its own handler.

## Recent meaningful commits from this continuation

This continuation intentionally used many small, atomic commits. It produced **86 meaningful commits before this final handoff update**, rather than combining unrelated features into a few large commits.

Most recent/current examples:

- `0ff74bc03c9402d7a48227ba8de8c71ec0ad722c` — `docs: add application recovery test coverage`
- `58986a68ee91e7762817aed05eb731f0e59ab4d9` — `docs: record application recovery boundary`
- `005f6896c762ac504406da43793c003893966eca` — `test: avoid depending on react internal error logging`
- `080b0907eecaabd6baffca9d7324dfcdfb41ad7c` — `feat: protect root with recovery boundary`
- `b7386e09368fa57f50054129dc132d09460a5fcb` — `test: cover application recovery boundary`
- `68e8a994a4cab66b3b22754e7a22bde950ff529f` — `feat: add application error recovery boundary`
- `6ea79d72fbe5b2d149211d0363a33d1904840314` — `feat: add application recovery messages`
- `bc08b04cdd0dc80c1b83611f34461bd6b332defe` — `docs: align contribution quality gates`
- `08ba12d544a5a8486dbf6a98f3e8989e7ba4aaea` — `fix: correct development guide repository tree`
- `34d757870a906b2094c8b85226d9b624e9f3fd0d` — `docs: align contributor development workflow`
- `dbeef3798a49b09d5f180cfc007f0c1559749962` — `docs: document progressive history performance guard`
- `e447f59c086533078c720dc444caaa43255dc4b5` — `docs: refresh readme for hardened release candidate`
- `8176a646...` — `docs: record i18n and large history improvements`
- `7725fa17...` — `docs: add parser i18n and history test coverage`
- `6c1fec39...` — `ci: gate release builds on documentation links`
- `3106ea32...` — `ci: verify documentation links on every change`
- `3e0bc998...` — `build: expose documentation link audit`
- `db44030b...` — `build: add documentation link checker`
- `c49710b7...` — `docs: mark i18n history and parser hardening complete`
- `bbe7a40d...` — `test: cover progressive history rendering`
- `c48b7ceb...` — `perf: progressively render large roll histories`
- `1c414d91...` — `refactor: enforce locale catalog compatibility`
- `1a03e238...` — `refactor: define extensible locale catalog type`
- `8f59f0bc...` — `test: enforce locale catalog contract`
- `0b80a9b6...` — `docs: add localization contributor guide`
- `36059111...` — `docs: align architecture with parity and i18n`
- `ac2ddf37...` — `refactor: localize built-in preset content`
- `1414c15b...` — `refactor: externalize app-level interface strings`
- `d66b8488...` — `refactor: externalize settings screen strings`
- `708f1cf3...` — `refactor: externalize probability screen strings`
- `e2cdb567...` — `refactor: externalize history screen strings`
- `cfa2f648...` — `refactor: externalize roll workspace strings`
- `e899eafe...` — `refactor: externalize command palette strings`
- `9d0179dd...` — `refactor: externalize onboarding strings`
- `c2f02c5d...` — `refactor: externalize navigation strings`
- `2829d376...` — `feat: add locale catalog boundary`
- `1ec1c7ce...` — `feat: add externalized English message catalog`
- `0b604a76...` — `test: add generated parser normalization invariants`
- `7f8af566...` — `ci: enforce locked reproducible quality checks`
- `a34903ec...` — `test: cover settings to about navigation`
- `1dce1fce...` — `feat: add updates and about settings section`
- `63a8c539...` — `refactor: centralize application metadata`
- `5ae97161...` — `test: guard exact probability numeric limits`
- `2180a65a...` — `fix: preserve exact probability outcome counts`
- `0160a038...` — `docs: guarantee seeded cross-runtime parity`
- `57902363...` — `test: pin cross-runtime seeded reference vectors`
- `ce6743c1...` — `fix: align desktop seeded rng with web`
- `1fcc0945...` — `ci: publish verified draft release bundles`
- `deebf16b...` — `test: cover onboarding keyboard entry`
- `9d2928fb...` — `a11y: focus onboarding primary action`
- `8855f414...` — `test: cover command palette keyboard focus`
- `6064be8a...` — `a11y: trap and restore command palette focus`
- `1ae9993d...` — `test: cover corrupted local storage recovery`
- `83878818...` — `fix: recover safely from corrupted local storage`
- `11f53928...` — `refactor: centralize persisted data validation`
- `d0043417...` — `test: cover maximum user seed backup round trip`
- `f0123852...` — `fix: accept valid sequenced deterministic seeds`
- `8ae76b9e...` — `test: cover roll history and export journey`
- `af4d259e...` — `test: provide stable browser environment stubs`

The GitHub connector does not expose commit-email selection, so these connector commits cannot be guaranteed to carry the requested author email even though repository guidance/configuration records it.

## Continuation rule

On the next continuation:

1. read this file first;
2. inspect latest `main` and current CI/check evidence;
3. do not reimplement completed Phase 0–5 features unless a failing check or real defect requires it;
4. prioritize observable clean-checkout/release evidence and fix every reported defect;
5. keep creating small meaningful commits;
6. update this file after meaningful work and before ending the continuation.
