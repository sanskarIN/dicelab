# DiceLab — Development Handoff

_Last updated: 2026-08-19_

This file is the primary continuity record for continuing DiceLab in another chat/session. Read this file, the current repository tree, open issues/PRs, and recent commits before making new changes.

## Current milestone

- Project: **DiceLab**
- Repository: `https://github.com/sanskarIN/dicelab`
- Visibility/source model: public, open source
- License: MIT
- Current application version in source: `0.1.0`
- Current delivery state: **Phase 6 audit in progress**
- Working audit branch: `audit/phase-6`
- Default branch: `main`
- Preferred Git author email: `sanskarin@outlook.in`
- GitHub-created commits in this session are authored/committed as `Sanskar <sanskarin@outlook.in>`.

Do **not** tag `v0.1.0` yet. A release tag should be created only after the exact release commit has passed clean checkout, CI, native packaging, security/dependency review, and release-candidate verification.

## Work completed

### Repository and tooling

- Bootstrapped the application from a repository that initially contained only `LICENSE`.
- Added Node/TypeScript/Vite/React/Tauri package configuration.
- Added strict TypeScript project references and browser/tooling configs.
- Added ESLint typed rules, Prettier configuration, `.editorconfig`, `.gitattributes`, `.gitignore`, and `.env.example`.
- Added an application icon at `src-tauri/icons/icon.png`.
- Added GitHub CI, dependency-lock bootstrap automation, CodeQL, release-build workflow, Dependabot, funding configuration, issue templates, and pull-request template.

### Dice domain

Implemented:

- `d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `d100`, and custom-sided dice.
- Dice pools with modifiers.
- Keep/drop syntax:
  - `khN` — keep highest
  - `klN` — keep lowest
  - `dhN` — drop highest
  - `dlN` — drop lowest
- Input limits for dice count, side count, selection count, and modifier magnitude.
- Normalized expression formatting.
- Stable tie behavior using original die indices.
- Secure browser randomness using Web Crypto and rejection sampling.
- Deterministic seeded browser randomness.
- Native Rust secure randomness using `OsRng`.
- Native deterministic seeded mode using `StdRng`.
- Explicit secure/seeded UI distinction.
- Exact ordinary-sum probability calculation using dynamic programming.
- Exact manageable keep/drop probability enumeration with an interactive complexity guard.
- Roll statistics: count, min/max, mean, median, and frequencies.

### Native/Tauri application

Implemented:

- Tauri 2 Rust project and desktop entry point.
- Native `roll_expression` command.
- Rust-side validation of all dice expressions before random generation.
- Restrictive application CSP and development CSP.
- Minimal `core:default` Tauri capability for the main window; no broad shell/filesystem plugin permission was added.
- Cross-platform bundle configuration for Windows, macOS, and Linux.
- Rust regression test protecting against extreme negative modifier overflow.

### User interface

Implemented a responsive product UI with:

- sidebar desktop navigation;
- compact mobile/web bottom navigation;
- first-run onboarding;
- dice studio;
- quick standard-die buttons;
- custom expression editor with live validation;
- current result, dropped-die styling, modifier/seed details;
- built-in tabletop presets;
- custom preset creation/deletion;
- searchable roll history;
- summary statistic cards;
- observed-history histogram;
- CSV and JSON roll-log exports;
- exact probability calculator;
- theme setting: system/light/dark;
- reduced-motion mode;
- explicit dice-animation setting;
- secure/seeded randomness setting and seed field;
- configurable history retention from 10 to 5,000 rolls;
- JSON backup export;
- validated JSON backup import/restore;
- local-data reset with deliberate confirmation;
- command palette with `Ctrl/Cmd + K` and Escape handling;
- About screen containing project identity, MIT license, support contacts, GitHub, BMC, privacy, and **Made by the Sanskar**.

### Backup/import security

Backup schema version `1` is implemented.

Import checks include:

- 5 MB file-size limit;
- supported schema version;
- maximum 5,000 history entries;
- maximum 500 custom presets;
- roll object shape and numeric sanity;
- preset object shape and length limits;
- expression re-validation for imported history/presets;
- theme/random-mode validation;
- setting normalization;
- built-in presets are recreated by the application rather than trusted from an imported file.

### Accessibility baseline

Implemented:

- semantic native controls;
- keyboard navigation;
- skip-to-content link;
- visible focus styles;
- `aria-current` navigation state;
- accessible expression labels/errors;
- live result/error/status regions where useful;
- reduced-motion support through app settings and `prefers-reduced-motion`;
- dropped dice indicated by more than color;
- responsive touch-friendly controls;
- documented manual accessibility release checklist.

### Offline and privacy behavior

- Core rolling, history, presets, probability, settings, backup, and export workflows require no account.
- Runtime application data uses versioned local browser/webview storage.
- Storage failures degrade to in-memory operation rather than blocking dice rolls.
- Core product does not require a remote application database.
- No analytics/advertising SDK was added.
- Privacy/security behavior is documented in `PRIVACY.md` and `SECURITY.md`.

## Files added or materially changed

### Root configuration

- `.editorconfig`
- `.env.example`
- `.gitattributes`
- `.gitignore`
- `.prettierrc.json`
- `eslint.config.js`
- `index.html`
- `package.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vitest.config.ts`

### Frontend application

- `src/App.tsx`
- `src/main.tsx`
- `src/styles.css`
- `src/components/AboutPanel.tsx`
- `src/components/AppShell.tsx`
- `src/components/CommandPalette.tsx`
- `src/components/HistoryPanel.tsx`
- `src/components/Onboarding.tsx`
- `src/components/ProbabilityPanel.tsx`
- `src/components/RollWorkspace.tsx`
- `src/components/SettingsPanel.tsx`

### Domain and services

- `src/domain/types.ts`
- `src/domain/parser.ts`
- `src/domain/random.ts`
- `src/domain/engine.ts`
- `src/domain/probability.ts`
- `src/domain/statistics.ts`
- `src/services/storage.ts`
- `src/services/export.ts`
- `src/services/roll-service.ts`

### Automated tests

- `src/test/setup.ts`
- `src/domain/parser.test.ts`
- `src/domain/engine.test.ts`
- `src/domain/probability.test.ts`
- `src/services/export.test.ts`
- `src/services/backup.test.ts`
- Rust unit tests embedded in `src-tauri/src/lib.rs`

### Native application

- `src-tauri/Cargo.toml`
- `src-tauri/build.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/icons/icon.png`
- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`

### Documentation

- `README.md`
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
- `docs/adr/README.md`
- `docs/adr/0001-modular-monolith.md`
- `docs/adr/0002-randomness-modes.md`
- `docs/adr/0003-local-persistence.md`

### GitHub repository configuration

- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/pull_request_template.md`
- `.github/dependabot.yml`
- `.github/FUNDING.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/lockfiles.yml`
- `.github/workflows/release.yml`

## Tests implemented

### TypeScript/Vitest

`src/domain/parser.test.ts`

- normal expression normalization;
- omitted dice-count parsing;
- custom-side parsing;
- keep/drop parsing;
- invalid count/sides/selection/text rejection.

`src/domain/engine.test.ts`

- keep-highest + modifier totals;
- deterministic seeded sequences;
- generated-value range invariants.

`src/domain/probability.test.ts`

- classic `2d6` exact distribution;
- exact `2d20kh1` distribution;
- exact `4d6kh3` bounds/outcome count;
- complexity-limit rejection.

`src/services/export.test.ts`

- JSON serialization;
- CSV header/escaping.

`src/services/backup.test.ts`

- valid backup round trip;
- unsupported schema rejection;
- malformed imported dice-expression rejection.

### Rust

`src-tauri/src/lib.rs`

- keep-highest expression parsing;
- dropping all dice rejection;
- extreme negative modifier rejection without integer overflow;
- stable keep-highest selection behavior;
- deterministic seeded roll reproduction.

## Verification performed in this session

### Repository inspection

- GitHub repository metadata successfully fetched.
- Repository confirmed accessible with admin/push permission through the connected GitHub integration.
- Initial tree confirmed that only `LICENSE` existed before implementation.
- Main-branch commit metadata confirmed connector commits use author/committer email `sanskarin@outlook.in`.
- Repository tree was re-fetched after implementation and required source/documentation directories were present.

### Local execution environment

The available local execution container was inspected:

- Node.js available: `v22.16.0`
- npm available: `10.9.2`
- global TypeScript compiler available: `5.8.3`
- Rust/Cargo toolchain not installed in that container.
- project npm dependencies are not preinstalled.
- cloning/downloading dependencies from GitHub/package registries failed because the container could not resolve external hosts.

Therefore this session **must not claim** that npm install, Vite build, Vitest, ESLint, Prettier, Cargo test, Clippy, or desktop packaging passed locally. The repository CI/PR audit is the correct remaining verification path.

### CI status limitation

A combined-status query on an earlier main commit returned no status contexts through the connector. The repository therefore has not yet been declared green.

`package-lock.json` was explicitly checked after the dependency-lock workflow was added and was still absent at that point. `Cargo.lock` should be treated as pending until explicitly verified.

The lockfile workflow was hardened to rebase against the latest `main` before pushing generated lockfiles so later commits do not cause an avoidable non-fast-forward failure.

The normal CI workflow was hardened so it can verify the pre-lock bootstrap state, while using `npm ci`/Cargo `--locked` automatically once lockfiles exist.

## Bugs fixed during implementation

### Native modifier overflow

The Rust parser initially used `modifier.abs()` to enforce a modifier-magnitude limit. `i64::MIN.abs()` can overflow, so this was replaced with a safe inclusive range check:

```text
-MAX_ABS_MODIFIER <= modifier <= MAX_ABS_MODIFIER
```

A regression test for `1d6-9223372036854775808` was added.

### Lockfile automation push race

The initial lockfile workflow committed generated lockfiles and pushed directly. If `main` advanced while the job was running, that could fail as non-fast-forward. The workflow now pulls/rebases from `origin/main` before its push.

### CI before first lockfiles

The initial Rust CI commands required `--locked` even when `Cargo.lock` had not yet been generated. CI now uses locked mode when the file exists and normal resolution only during the bootstrap state.

## Known limitations / unfinished verification

These are not hidden; they are the exact remaining release blockers or quality follow-ups.

1. **Full CI has not yet been proven green on the final audit commit.**
2. **Dependency lockfiles must be explicitly verified as generated and committed.**
3. **Windows/macOS/Linux release bundles have not yet been verified from the final release commit.**
4. **Real release screenshots have not been captured.** README intentionally does not present fabricated screenshots as shipping captures.
5. **Manual screen-reader/keyboard release review has not yet been recorded.**
6. **Browser end-to-end test automation is not yet implemented.**
7. **Component-level automated accessibility smoke tests are not yet implemented.**
8. **Property/fuzz testing and repeatable performance benchmarks remain follow-up quality work.**
9. **English user-facing strings are currently present directly in components.** The architecture is intentionally kept easy to migrate, but a complete externalized translation catalog is not yet implemented and should be completed before claiming full i18n readiness.
10. **Native signed/notarized artifacts require external signing credentials and cannot be created safely from source-controlled secrets.**
11. **Branch protection is currently not enabled on `main` in the repository metadata observed during this session.** Enable it after the required check names are proven stable.

## Exact next tasks

Continue in this order:

1. Open/complete the Phase 6 audit PR from `audit/phase-6` to `main` so pull-request-triggered workflows can be inspected through the GitHub connector.
2. Fetch the PR head SHA and workflow run/jobs.
3. Fix every real formatting, lint, TypeScript, test, Rustfmt, Clippy, or build failure on the audit branch.
4. Verify whether `package-lock.json` and `src-tauri/Cargo.lock` were generated. If missing, generate them using a network-enabled GitHub Actions runner and commit them with author email `sanskarin@outlook.in`.
5. Re-run CI until required checks are green.
6. Update `ROADMAP.md` to mark backup import complete and to reflect actual verified audit results.
7. Update `CHANGELOG.md` if fixes from the audit change user-visible behavior.
8. Add externalized English string catalogs and migrate UI strings before claiming full i18n readiness.
9. Add at least browser E2E primary-journey coverage and component accessibility smoke coverage when tooling is available.
10. Run/record Windows, macOS, and Linux release bundle verification.
11. Capture real release-candidate screenshots and place them in documented repository paths; update README screenshot section.
12. Perform documentation-link/security/dependency audit.
13. Enable branch protection for `main` using proven required checks, if repository settings permit it.
14. Update this file with final commands/results and final commit hashes.
15. Only then prepare/tag `v0.1.0`.

## Migration notes

- Runtime local-storage schema remains version `v1`; no migration is currently required.
- Backup schema is version `1`.
- Future incompatible local-storage changes must introduce a migration or new versioned key.
- Future backup schema versions must validate the incoming version and define an explicit migration path; do not silently reinterpret unknown schemas.
- Built-in presets are application-owned and are not restored from backup input.

## Release notes draft — 0.1.0

### Dice rolling

- Standard/custom dice with modifiers and keep/drop expressions.
- Secure random and deterministic seeded modes.
- Native Rust dice command for Tauri desktop.

### History and probability

- Local history, filtering, statistics, and histogram.
- CSV/JSON exports.
- Exact common-expression probability calculator with complexity guards.

### Presets and data

- Built-in tabletop presets.
- Custom presets.
- Versioned local storage.
- JSON backup export and validated restore.

### Experience

- Responsive desktop/web interface.
- light/dark/system themes.
- reduced-motion and non-animation controls.
- command palette.
- first-run onboarding.
- About/support/privacy surfaces.

### Security/privacy

- local-first core product with no required account.
- restrictive Tauri CSP.
- minimal Tauri capabilities.
- bounded input validation on TypeScript and Rust boundaries.
- responsible-disclosure documentation and CodeQL workflow.

### Known pre-release blockers

Do not publish these notes as a final release until CI, platform packaging, lockfiles, screenshots, and release-candidate checks are complete.

## Recent meaningful commits

Recent commits at the time this handoff was written include:

- `d542e96` — `ci: add cross-platform tagged release builds`
- `dbf64d0` — `ci: add CodeQL static analysis`
- `1671237` — `chore: configure optional project funding link`
- `b59361d` — `chore: configure automated dependency updates`
- `14f9154` — `docs: add pull request quality checklist`
- `b8ca678` — `docs: add structured feature request template`
- `c7f9419` — `docs: add structured bug report template`
- `bc0a33d` — `docs: record local persistence decision`
- `464d985` — `docs: record randomness mode security decision`
- `d38bb75` — `docs: record modular monolith architecture decision`
- `95ef42e` — `docs: index architecture decision records`
- `ec45d9c` — `docs: add troubleshooting guide`
- `6b2a62c` — `docs: add reproducible release process`
- `b32e17a` — `build: standardize frontend formatting rules`
- `ee84225` — `chore: document optional local environment placeholders`
- `8840c3e` — `ci: support verification before lockfile bootstrap`
- `83e59d1` — `fix: reject extreme modifiers without overflow`
- `76ee734` — `test: cover backup validation and restore parsing`
- `4258356` — `feat: restore validated local backups`
- `c060990` — `feat: add validated backup import controls`
- `33dae8f` — `feat: validate and restore DiceLab backups`
- `a4262cf` — `docs: define phased DiceLab roadmap`
- `21e8a8e` — `docs: add complete DiceLab project guide`
- `3167868` — `feat: add DiceLab desktop application icon`
- `711139d` — `ci: verify web and Rust quality gates`
- `3836ac9` — `test: verify exact probability distributions`
- `82d5622` — `test: verify deterministic rolls and keep drop totals`
- `77a5f43` — `feat: implement native secure dice engine`
- `60dfcc0` — `feat: implement responsive DiceLab design system`
- `4263c33` — `feat: connect complete DiceLab application workflow`
- `eb1561b` — `feat: calculate exact dice probability distributions`
- `2bcfe52` — `feat: implement dice roll engine with keep and drop`
- `b70187b` — `feat: parse validated dice expressions`

## Continuation rule

Do not replace working code or restart the project. Continue from the next unfinished audit task, update tests/docs with every meaningful change, keep commits small and meaningful, and update this file again before ending another session.

**Made by the Sanskar**
