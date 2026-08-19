# DiceLab — Work Handoff

## Current milestone

Phase 4 — verification, regression coverage, import/export hardening, and release-candidate quality work.

## Repository state inspected

- Repository: `sanskarIN/dicelab`
- Default branch: `main`
- Visibility: public
- Existing stack: React + TypeScript + Vite with Tauri 2 desktop shell
- Existing architecture includes domain parser/engine/probability/statistics modules, local persistence, roll history, presets, probability UI, settings, onboarding, command palette, backup/import/export, CI, CodeQL, release workflow, documentation, and ADRs.
- Baseline commit when this continuation started: `f499161b0ddb8bbf82532e2ec4967a7fa9bca21f` — `build: lock application dependencies`.

## Completed work in this continuation

- Inspected the uploaded DiceLab master prompt and current repository instead of replacing working code.
- Added this handoff file so later chats can resume from exact repository state.
- Hardened CSV export against spreadsheet formula injection by prefix-neutralizing values beginning with `=`, `+`, `-`, or `@` before normal RFC-style CSV quoting.
- Added CSV regression tests for formula-like values, including values that also contain quotes/commas.
- Hardened imported backup validation so malformed history cannot silently replace trusted local state.
- Imported roll records now validate expression/roll consistency: modifier, die count, die range, unique/bounded indices, keep/drop count, computed total, canonical timestamp, deterministic seed presence, and bounded seed length.
- Preset timestamps are validated as canonical ISO timestamps during backup import.
- Added regression tests for malformed expressions, out-of-range dice, incorrect totals, duplicate indices, impossible keep/drop state, missing deterministic seeds, and malformed timestamps.
- Added dedicated statistics tests for empty state, min/max/mean, odd/even medians, sorted frequencies, percentages, and non-mutation of history order.
- Added deterministic random-source tests for repeatability, bounds, invalid ranges, seed hashing, and Unicode input.
- Updated `CHANGELOG.md` to document the security/reliability hardening and added coverage.

## Files added or changed

- `what_changed.md`
- `src/services/export.ts`
- `src/services/export.test.ts`
- `src/services/backup.test.ts`
- `src/domain/statistics.test.ts`
- `src/domain/random.test.ts`
- `CHANGELOG.md`

## Tests added or expanded

- CSV formula-injection regression coverage.
- Backup-import integrity/security regression coverage.
- Roll-statistics unit coverage.
- Seeded-random and seed-hash unit coverage.

## Commands/checks run and results

- GitHub repository metadata lookup: succeeded; authenticated integration has admin/push access.
- Repository tree inspection through GitHub API: succeeded.
- Latest commit history inspection: succeeded.
- Combined status lookup for baseline `f499161...`: no commit statuses were reported by the connector.
- Pull-request-triggered workflow-run lookup for baseline `f499161...`: no workflow runs were reported by that endpoint.
- Combined status lookup after this continuation (`1d891d0...`): no commit statuses were reported by the connector at check time.
- Direct local `git clone` attempt: failed because the execution sandbox cannot resolve `github.com`; repository reads/writes therefore used the authenticated GitHub connector.

## Verification limitation

The GitHub connector used for repository writes exposes commit messages but does not expose commit author/email parameters on file create/update operations. Therefore `sanskarin@outlook.in` cannot be forced as the commit email from this interface. Existing local Git workflows should keep:

```bash
git config user.email sanskarin@outlook.in
```

The execution sandbox has no outbound DNS access to GitHub, so a clean local clone/build could not be performed in this continuation. Changes were kept narrowly scoped and covered by repository tests, but final clean-checkout verification must run in GitHub Actions or another network-enabled development machine.

## Known limitations / open issues

- Clean-checkout `npm ci && npm run build && npm test && npm run lint && npm run format` still needs a runner with repository network access.
- Tauri/Rust checks and platform builds should be observed on Windows, macOS, and Linux before the release candidate is tagged.
- The repository still needs final real screenshots/demo captures if placeholders remain in README/docs.
- Final Phase 6 cannot be truthfully marked complete until clean-checkout CI, dependency/security checks, documentation-link checks, and release-candidate packaging are observed passing.

## Next exact tasks

1. Observe/run the full GitHub Actions quality suite for the latest `main` commit and fix any reported TypeScript, formatting, lint, Rust, or packaging failures.
2. Add UI/integration tests for the primary roll → history → export and settings → backup restore journeys.
3. Add accessibility automation for core React surfaces where practical and manually review keyboard/focus behavior.
4. Inspect README screenshot/demo placeholders and replace them with real captures before release.
5. Run release-candidate builds on all supported desktop platforms and verify generated artifacts.
6. Perform Phase 6 documentation-link, secret, dependency, and clean-clone audits before tagging `0.1.0`.

## Migration notes

No storage schema migration is required by this continuation. Backup schema remains version `1`; validation is stricter but the data model is unchanged.

## Release notes draft

### Unreleased

- Security: CSV history export now neutralizes spreadsheet-formula prefixes before CSV quoting.
- Security/Reliability: backup restore now rejects internally inconsistent or malformed roll records before state replacement.
- Quality: expanded backup, export, statistics, deterministic RNG, and seed-hashing regression coverage.
- Documentation: changelog and continuation handoff now reflect the current Phase 4 state.

## Meaningful commits created in this continuation

- `7fbd2682b885a68631e6e869524679ff1abd6dd5` — `docs: add continuation handoff for phase 4`
- `cbf7b1219d31c612c10f969c5e99105ccbef20e0` — `fix: neutralize spreadsheet formulas in csv export`
- `8b4cd6c1c078ca20d5d238a9bed4152de2c10975` — `test: cover csv formula injection regression`
- `2e9bc0c226ded26191ce0e923ef9f027a6c5dbd3` — `fix: reject inconsistent imported roll records`
- `8342e0c0102a0ef554a16598b446471ab0f5e8d3` — `refactor: keep imported expression typing explicit`
- `c5dad5b4d1d1eed08104a8d67b1188380ea036d2` — `test: cover malformed backup roll records`
- `9b39316386d7ec8757bea2bd0eaa7809c920d8a9` — `fix: correct csv regression test quoting`
- `30e2f9dcc76fe9bfd32b73c735a75d38594e953c` — `test: cover roll statistics edge cases`
- `44ac9c6c33461b7d42668cee7d9f12edb09c518d` — `test: cover deterministic random source boundaries`
- `1d891d0fc7f552e6c9da86b343c9b8a9842b14c3` — `docs: record import and export hardening`

Update this file after every meaningful continuation.