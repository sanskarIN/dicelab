# Testing Strategy

DiceLab uses layered tests so failures are caught near the responsibility that caused them.

## Frontend/domain tests

Run:

```bash
npm run test
```

Current automated coverage includes:

- expression parsing and validation boundaries;
- stable parser error codes plus immutable localization context;
- 500 generated parser normalization invariants plus case/whitespace equivalence;
- keep/drop selection and modifier totals;
- deterministic seeded random sequences and fixed cross-runtime reference vectors;
- probability distributions, complexity limits, exact-number precision boundaries, and stable probability error codes;
- roll-history filtering by expression/total and order preservation;
- roll statistics and distribution summaries;
- CSV/JSON serialization, including spreadsheet-formula neutralization;
- browser-versus-Tauri runtime detection and export routing;
- browser download fallback, native save-command invocation, and native save-dialog cancellation behavior;
- localized/safe history and backup export status feedback without raw error disclosure;
- backup validation, duplicate-record rejection, metadata normalization, stable backup error codes, locale compatibility, and round trips;
- localized parser/probability/backup error mapping without dependence on exception prose;
- corrupted local-storage recovery, locale persistence, and settings normalization;
- localized built-in presets while user-created preset copy remains unchanged;
- typed English/Hindi catalog defaults, live switching, and dynamic helper behavior;
- explicit `en-US`/`hi-IN` number formatting and active-locale presentation formatting;
- localized roll-result and probability presentation regression coverage;
- live Hindi app switching, document-language metadata, and persisted language preference;
- structured logger redaction, bounded context, and raw-error omission;
- safe operational logging for blocked/corrupted storage and the application recovery boundary;
- primary app integration journeys for rolling, history, CSV export, backup restore, Settings → About navigation, and language switching;
- command-palette keyboard focus trapping/restoration;
- onboarding dialog semantics and initial focus;
- Settings reduced-motion, language, backup-export, release, and About actions;
- progressive large-history rendering and filter-window resets;
- application root error-boundary fallback behavior and redacted DiceLab recovery logging.

Use `npm run test:watch` during development and `npm run test:coverage` when reviewing coverage gaps.

## Rust tests

Run:

```bash
cd src-tauri
cargo test --locked
```

Native tests cover:

- parsing and invalid selection rules;
- keep/drop selection;
- deterministic seeded behavior and the same fixed seeded/hash vectors used by TypeScript;
- native text-export suggested filename/format validation;
- export payload size limits;
- final selected-file extension validation;
- generated parser normalization invariants and an adversarial malformed-input corpus.

The paired seeded vectors are a compatibility guard: a given effective seed must produce the same deterministic values in web and desktop runtimes.

A manifest change is not verified merely because source code compiles conceptually. If `src-tauri/Cargo.toml` changes, regenerate `src-tauri/Cargo.lock` and run the locked Rust checks before treating the dependency graph as release-ready.

## Coverage-guided Rust parser fuzzing

The normal Rust unit suite stays deterministic. Coverage-guided fuzzing is a separate verification layer.

From `src-tauri`, with Rust nightly and `cargo-fuzz` installed:

```bash
cargo +nightly fuzz run parser
```

For a bounded smoke campaign:

```bash
cargo +nightly fuzz run parser -- -max_total_time=60
```

The fuzz target feeds arbitrary UTF-8 input into the production parser. Successful parses must normalize to a representation that parses again while preserving count, sides, modifier, and normalized text.

`.github/workflows/fuzz.yml` also provides a manual and scheduled bounded campaign. A configured workflow is not release evidence by itself; record an observed green campaign on the intended commit or release candidate before marking that evidence complete.

If fuzzing finds a crash or invariant failure, convert the minimized case into a deterministic Rust regression test before merging the fix. See [`../src-tauri/fuzz/README.md`](../src-tauri/fuzz/README.md).

## Static and security quality checks

Frontend/repository:

```bash
npm run security:secrets:test
npm run security:secrets
npm run test:e2e:infra
npm run docs:check
npm run format
npm run lint
npm run test
npm run build
npm run test:e2e
```

The production build is also the TypeScript type check because the build script runs `tsc -b` before Vite. `npm run test:e2e` requires that production build to exist first.

`npm run security:secrets:test` uses Node's built-in test runner to verify high-confidence token/private-key detection without printing matched secret values. `npm run security:secrets` scans the checked-out repository for high-confidence credential formats and tracked `.env*` files other than documented templates. CI/release workflows run both before dependency installation.

`npm run test:e2e:infra` uses Node's built-in test runner to verify the DevTools protocol transport and `node --check` to validate the browser-runner syntax. It does not require a browser, which helps separate automation-client defects from browser-environment failures.

`npm run docs:check` scans repository Markdown files and fails on missing relative link targets or malformed percent-encoding. External URLs are intentionally outside this local existence check and should still be reviewed during release preparation when network access is available.

Rust:

```bash
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

## Real-browser end-to-end smoke

After `npm run build`, run:

```bash
npm run test:e2e
```

The dependency-free Node 22/CDP runner starts the production Vite preview and drives a Chromium-compatible browser through these cross-layer workflows:

- first-run onboarding;
- real dice-expression entry and roll;
- History visibility;
- actual CSV browser download and content verification;
- browser reload and local-storage persistence;
- `Ctrl+K` command palette focus and Escape dismissal;
- exact `2d6` probability calculation;
- actual JSON backup browser download;
- two-step local-data clearing;
- real file-input backup restore;
- restored roll history.

Normal CI and tagged release web verification run this smoke after the production build. Browser discovery supports `CHROME_BIN` plus common Chrome/Chromium install locations.

The hardening execution container used on August 19, 2026 has Chromium installed but its administrator policy blocks loopback browser navigation with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. The full E2E journey therefore cannot be claimed locally passing from that container. The extracted CDP transport self-test was executed there independently and passed 5/5 tests. A full browser pass must be observed in GitHub Actions or another unrestricted browser environment before it counts as release evidence.

See [`e2e.md`](e2e.md) for the runner architecture, browser requirements, exact scenario, and debugging guidance.

## Desktop export smoke coverage

The browser E2E suite intentionally validates the browser download path. It does not prove the Tauri-native system-dialog path.

On every supported desktop release candidate, verify separately that:

1. History CSV opens the native save dialog.
2. History JSON opens the native save dialog.
3. Backup export opens the native save dialog.
4. Canceling the dialog creates no file and shows no failure state.
5. Saving creates only the selected `.csv`/`.json` file and the content matches the requested export.
6. A native save failure shows generic localized status rather than a private filesystem path or raw OS error.
7. The webview still has no broad filesystem or shell capability.

See [`native-exports.md`](native-exports.md) for the trust boundary.

## Executable benchmarks

Run:

```bash
npm run bench
```

The benchmark suite uses the already-locked Vitest toolchain and covers parser throughput, seeded/browser-secure RNG generation, ordinary and keep/drop probability calculations, 5,000-record history filtering, and 5,000-record statistics.

Benchmark results are measurements rather than pass/fail tests. Record the commit, hardware, OS, Node/npm versions, and complete output before using numbers as release evidence. See [`performance.md`](performance.md).

## Required regression tests

Every fixed correctness bug should receive a test that fails before the fix and passes after it. Security-boundary fixes should include malformed/untrusted input cases. Cross-runtime deterministic changes must update both TypeScript and Rust reference-vector tests in the same release.

Generated/parser-property tests should remain deterministic: they should exercise many valid shapes without relying on nondeterministic fuzz input inside the normal CI suite. Coverage-guided fuzz discoveries belong in the fuzz harness first and should become deterministic unit regressions when actionable.

Stable error codes are compatibility surfaces for localization. New parser/probability/backup codes require both domain tests and localized-mapping tests.

New localized presentation values should use the shared `src/i18n/format.ts` boundary and receive at least one non-English formatting regression where grouping/date/time behavior can differ.

Cross-layer bugs discovered by the real-browser or desktop smoke should also receive a lower-level regression test when there is a stable unit/component/domain boundary that can reproduce them.

## Manual smoke matrix

Before a release, verify at least:

1. First-run onboarding can be completed using only a keyboard.
2. Quick dice and custom expressions roll successfully.
3. Invalid expressions show useful localized errors without changing history.
4. Secure and seeded modes are visually distinguishable.
5. The same effective seeded expression produces identical deterministic values in web and desktop builds.
6. Keep/drop dice are visually and textually identifiable.
7. History search, clear confirmation, CSV, and JSON export work.
8. Histories above 200 matching rows progressively reveal additional entries without changing summary statistics or exports.
9. A valid backup restores settings/history/presets, including a supported locale preference.
10. An invalid, duplicate-ID, inconsistent, or oversized backup is rejected safely with user-correctable localized feedback.
11. Probability calculator handles common expressions and rejects calculations whose exactness/performance budgets would be exceeded.
12. Theme and reduced-motion preferences apply immediately.
13. English/Hindi selection updates visible copy, document `lang`, built-in presets, and locale-sensitive presentation formatting without rewriting user-created data.
14. Command palette opens with `Ctrl/Cmd + K`, traps focus while open, restores focus on close, and closes with Escape.
15. Settings exposes version/releases/About information.
16. About links and support details are correct.
17. English and Hindi catalog-backed labels remain readable at narrow widths and 200% zoom.
18. A deliberately induced development-only React render failure displays the recovery surface; reloading restores normal startup and does not clear local history/settings.
19. Storage-blocking/privacy-mode behavior keeps the app usable and emits no private thrown text.
20. The packaged desktop build independently completes secure/seeded roll, persistence, native export/restore, language switching, and version/About checks on each supported operating system.

## Accessibility checks

Automated keyboard and component semantics now cover the modal entry points and selected settings/recovery behavior. Real-browser E2E checks keyboard command-palette entry/focus/dismissal in the production web bundle. Automation does not replace manual review. Follow [`accessibility.md`](accessibility.md).

## CI expectations

CI installs the committed npm and Cargo lockfiles with `npm ci` and Cargo `--locked` checks. It runs the secret-audit self-test and repository scan, E2E infrastructure self-test, documentation-link audit, frontend format/lint/unit/integration/build checks, real-browser E2E smoke, and Rust format/test/Clippy checks. Pull requests should not merge while required build, E2E, lint, test, format, documentation, secret, Clippy, or security checks are failing. A CI failure caused by an unavailable external service or browser policy must be documented rather than silently ignored.

A stale Cargo lockfile after `Cargo.toml` changes is a hard dependency-verification blocker. Do not reinterpret a configured lockfile-generation workflow as evidence that the generated lock has actually landed; inspect the repository and run locked Rust checks against the resulting commit.

CodeQL runs separately for JavaScript/TypeScript static analysis. Repository-level secret scanning/push protection should also be enabled where available as described in [`repository-governance.md`](repository-governance.md).

## Determinism

Tests must not depend on live production services or real secrets. Use explicit dates, IDs, and seeded random sources when repeatability matters. The E2E runner uses a fresh temporary browser profile and deletes its temporary downloads/profile after each run.
