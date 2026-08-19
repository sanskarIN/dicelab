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
- deterministic seeded random sequences;
- probability distributions for ordinary and keep/drop expressions;
- CSV/JSON serialization;
- backup validation and round trips.

Use `npm run test:watch` during development and `npm run test:coverage` when reviewing coverage gaps.

## Rust tests

Run:

```bash
cd src-tauri
cargo test
```

Native tests cover parsing, invalid selection rules, deterministic seeded behavior, and keep/drop selection.

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
cargo clippy --all-targets --all-features -- -D warnings
```

## Required regression tests

Every fixed correctness bug should receive a test that fails before the fix and passes after it. Security-boundary fixes should include malformed/untrusted input cases.

## Manual smoke matrix

Before a release, verify at least:

1. First-run onboarding can be completed using only a keyboard.
2. Quick dice and custom expressions roll successfully.
3. Invalid expressions show useful errors without changing history.
4. Secure and seeded modes are visually distinguishable.
5. Keep/drop dice are visually and textually identifiable.
6. History search, clear confirmation, CSV, and JSON export work.
7. A valid backup restores settings/history/presets.
8. An invalid or oversized backup is rejected safely.
9. Probability calculator handles common expressions and rejects overly complex keep/drop calculations.
10. Theme and reduced-motion preferences apply immediately.
11. Command palette opens with `Ctrl/Cmd + K` and closes with Escape.
12. About links and support details are correct.

## Accessibility checks

Automated component accessibility coverage should be expanded before 1.0, but automation does not replace manual review. Follow [`accessibility.md`](accessibility.md).

## End-to-end roadmap

A browser E2E suite should cover:

- onboarding → roll → history;
- save/delete preset;
- settings persistence across reload;
- export/import backup;
- probability calculation;
- keyboard command navigation.

Desktop smoke coverage should verify the native Tauri command separately from the web fallback.

## Performance tests

Probability and large-history workflows are the first benchmark targets. See [`performance.md`](performance.md).

## CI expectations

Pull requests should not merge while required build, lint, test, format, Clippy, or security checks are failing. A CI failure caused by an unavailable external service must be documented rather than silently ignored.

## Determinism

Tests must not depend on live production services or real secrets. Use explicit dates, IDs, and seeded random sources when repeatability matters.
