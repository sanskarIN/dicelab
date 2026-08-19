# Testing Strategy

DiceLab uses layered tests so failures are caught near the responsibility that caused them.

## Frontend/domain tests

Run:

```bash
npm run test
```

Current automated coverage includes:

- expression parsing and validation boundaries;
- keep/drop selection and modifier totals;
- deterministic seeded random sequences and fixed cross-runtime reference vectors;
- probability distributions, complexity limits, and exact-number precision boundaries;
- roll statistics and distribution summaries;
- CSV/JSON serialization, including spreadsheet-formula neutralization;
- backup validation, duplicate-record rejection, metadata normalization, and round trips;
- corrupted local-storage recovery and settings normalization;
- primary app integration journeys for rolling, history, CSV export, backup restore, and Settings → About navigation;
- command-palette keyboard focus trapping/restoration;
- onboarding dialog semantics and initial focus;
- Settings reduced-motion behavior and release/About actions.

Use `npm run test:watch` during development and `npm run test:coverage` when reviewing coverage gaps.

## Rust tests

Run:

```bash
cd src-tauri
cargo test --locked
```

Native tests cover parsing, invalid selection rules, keep/drop selection, deterministic seeded behavior, and the same fixed seeded/hash vectors used by TypeScript. Those paired vectors are a compatibility guard: a given effective seed must produce the same deterministic values in web and desktop runtimes.

## Static quality checks

Frontend:

```bash
npm run format
npm run lint
npm run build
```

The production build is also the TypeScript type check because the build script runs `tsc -b` before Vite.

Rust:

```bash
cargo fmt --all -- --check
cargo clippy --all-targets --all-features --locked -- -D warnings
```

## Required regression tests

Every fixed correctness bug should receive a test that fails before the fix and passes after it. Security-boundary fixes should include malformed/untrusted input cases. Cross-runtime deterministic changes must update both TypeScript and Rust reference-vector tests in the same release.

## Manual smoke matrix

Before a release, verify at least:

1. First-run onboarding can be completed using only a keyboard.
2. Quick dice and custom expressions roll successfully.
3. Invalid expressions show useful errors without changing history.
4. Secure and seeded modes are visually distinguishable.
5. The same effective seeded expression produces identical deterministic values in web and desktop builds.
6. Keep/drop dice are visually and textually identifiable.
7. History search, clear confirmation, CSV, and JSON export work.
8. A valid backup restores settings/history/presets.
9. An invalid, duplicate-ID, inconsistent, or oversized backup is rejected safely.
10. Probability calculator handles common expressions and rejects calculations whose exactness/performance budgets would be exceeded.
11. Theme and reduced-motion preferences apply immediately.
12. Command palette opens with `Ctrl/Cmd + K`, traps focus while open, restores focus on close, and closes with Escape.
13. Settings exposes version/releases/About information.
14. About links and support details are correct.

## Accessibility checks

Automated keyboard and component semantics now cover the modal entry points and selected settings behavior. Automation does not replace manual review. Follow [`accessibility.md`](accessibility.md).

## Integration and end-to-end roadmap

The jsdom integration suite currently covers important browser application state transitions without requiring external services. A full browser E2E runner remains a pre-1.0 enhancement for real rendering, download behavior, reload persistence, and browser accessibility tooling.

Planned full-browser coverage should include:

- onboarding → roll → history;
- save/delete preset;
- settings persistence across reload;
- export/import backup with real browser file/download APIs;
- probability calculation;
- keyboard command navigation.

Desktop smoke coverage must verify the native Tauri command separately from the web fallback.

## Performance tests

Probability and large-history workflows are the first benchmark targets. See [`performance.md`](performance.md).

## CI expectations

CI installs the committed npm and Cargo lockfiles with `npm ci` and Cargo `--locked` checks. Pull requests should not merge while required build, lint, test, format, Clippy, or security checks are failing. A CI failure caused by an unavailable external service must be documented rather than silently ignored.

## Determinism

Tests must not depend on live production services or real secrets. Use explicit dates, IDs, and seeded random sources when repeatability matters.
