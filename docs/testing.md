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
- backup validation, duplicate-record rejection, metadata normalization, stable backup error codes, and round trips;
- localized parser/probability/backup error mapping without dependence on exception prose;
- corrupted local-storage recovery and settings normalization;
- structured logger redaction, bounded context, and raw-error omission;
- safe operational logging for blocked/corrupted storage and the application recovery boundary;
- primary app integration journeys for rolling, history, CSV export, backup restore, and Settings → About navigation;
- command-palette keyboard focus trapping/restoration;
- onboarding dialog semantics and initial focus;
- Settings reduced-motion behavior and release/About actions;
- typed locale catalog defaults/dynamic helper behavior;
- progressive large-history rendering and filter-window resets;
- application root error-boundary fallback behavior and redacted DiceLab recovery logging.

Use `npm run test:watch` during development and `npm run test:coverage` when reviewing coverage gaps.

## Rust tests

Run:

```bash
cd src-tauri
cargo test --locked
```

Native tests cover parsing, invalid selection rules, keep/drop selection, deterministic seeded behavior, and the same fixed seeded/hash vectors used by TypeScript. Those paired vectors are a compatibility guard: a given effective seed must produce the same deterministic values in web and desktop runtimes.

## Static and security quality checks

Frontend/repository:

```bash
npm run security:secrets:test
npm run security:secrets
npm run docs:check
npm run format
npm run lint
npm run test
npm run build
```

The production build is also the TypeScript type check because the build script runs `tsc -b` before Vite.

`npm run security:secrets:test` uses Node's built-in test runner to verify high-confidence token/private-key detection without printing matched secret values. `npm run security:secrets` scans the checked-out repository for high-confidence credential formats and tracked `.env*` files other than documented templates. CI/release workflows run both before dependency installation.

`npm run docs:check` scans repository Markdown files and fails on missing relative link targets or malformed percent-encoding. External URLs are intentionally outside this local existence check and should still be reviewed during release preparation when network access is available.

Rust:

```bash
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

## Executable benchmarks

Run:

```bash
npm run bench
```

The benchmark suite uses the already-locked Vitest toolchain and covers parser throughput, seeded/browser-secure RNG generation, ordinary and keep/drop probability calculations, 5,000-record history filtering, and 5,000-record statistics.

Benchmark results are measurements rather than pass/fail tests. Record the commit, hardware, OS, Node/npm versions, and complete output before using numbers as release evidence. See [`performance.md`](performance.md).

## Required regression tests

Every fixed correctness bug should receive a test that fails before the fix and passes after it. Security-boundary fixes should include malformed/untrusted input cases. Cross-runtime deterministic changes must update both TypeScript and Rust reference-vector tests in the same release.

Generated/parser-property tests should remain deterministic: they should exercise many valid shapes without relying on nondeterministic fuzz input inside the normal CI suite.

Stable error codes are compatibility surfaces for localization. New parser/probability/backup codes require both domain tests and localized-mapping tests.

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
9. A valid backup restores settings/history/presets.
10. An invalid, duplicate-ID, inconsistent, or oversized backup is rejected safely with user-correctable localized feedback.
11. Probability calculator handles common expressions and rejects calculations whose exactness/performance budgets would be exceeded.
12. Theme and reduced-motion preferences apply immediately.
13. Command palette opens with `Ctrl/Cmd + K`, traps focus while open, restores focus on close, and closes with Escape.
14. Settings exposes version/releases/About information.
15. About links and support details are correct.
16. English catalog-backed labels remain readable at narrow widths and 200% zoom.
17. A deliberately induced development-only React render failure displays the recovery surface; reloading restores normal startup and does not clear local history/settings.
18. Storage-blocking/privacy-mode behavior keeps the app usable and emits no private thrown text.

## Accessibility checks

Automated keyboard and component semantics now cover the modal entry points and selected settings/recovery behavior. Automation does not replace manual review. Follow [`accessibility.md`](accessibility.md).

## Integration and end-to-end roadmap

The jsdom integration suite currently covers important browser application state transitions without requiring external services. A full browser E2E runner remains a pre-1.0 enhancement for real rendering, download behavior, reload persistence, and browser accessibility tooling.

Planned full-browser coverage should include:

- onboarding → roll → history;
- save/delete preset;
- settings persistence across reload;
- export/import backup with real browser file/download APIs;
- probability calculation;
- keyboard command navigation;
- recovery-page reload behavior in a controlled development test route/build.

Desktop smoke coverage must verify the native Tauri command separately from the web fallback.

The repository currently has no locked Playwright or Vitest-browser dependency. Do not hand-edit the lockfile merely to claim E2E coverage; add a real browser runner from a network-enabled dependency-management environment and review the resulting lockfile/CI changes.

## CI expectations

CI installs the committed npm and Cargo lockfiles with `npm ci` and Cargo `--locked` checks. It runs the secret-audit self-test and repository scan, documentation-link audit, frontend format/lint/test/build checks, and Rust format/test/Clippy checks. Pull requests should not merge while required build, lint, test, format, documentation, secret, Clippy, or security checks are failing. A CI failure caused by an unavailable external service must be documented rather than silently ignored.

CodeQL runs separately for JavaScript/TypeScript static analysis. Repository-level secret scanning/push protection should also be enabled where available as described in [`repository-governance.md`](repository-governance.md).

## Determinism

Tests must not depend on live production services or real secrets. Use explicit dates, IDs, and seeded random sources when repeatability matters.
