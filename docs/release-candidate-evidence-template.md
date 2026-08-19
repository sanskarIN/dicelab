# DiceLab Release Candidate Evidence Template

Copy this file into a versioned release-evidence record when preparing a real candidate. Do not mark an item complete unless the evidence was actually observed for the exact candidate commit/artifact.

## Candidate identity

- Version:
- Tag:
- Source commit:
- Candidate date:
- Reviewer(s):
- GitHub Actions run URL/ID:
- Release draft URL/ID:

## Dependency and source integrity

- [ ] `package-lock.json` matches `package.json`.
- [ ] `src-tauri/Cargo.lock` matches `src-tauri/Cargo.toml`.
- [ ] `npm ci` completed from a clean checkout.
- [ ] `cargo test --locked` completed from the candidate commit.
- [ ] `cargo clippy --all-targets --all-features --locked -- -D warnings` completed.
- [ ] Repository secret audit completed without exposing matched secret values.
- [ ] Dependency/security alerts reviewed.
- [ ] CodeQL/security scanning reviewed.

Evidence:

```text
Paste command/run identifiers and concise results here. Do not paste secrets.
```

## Repository policy boundaries

- [ ] Desktop capability policy self-tests passed.
- [ ] Actual committed capability audit passed.
- [ ] Tauri CSP/IPC policy self-tests passed.
- [ ] Actual committed Tauri security configuration audit passed.
- [ ] Localized-formatting boundary audit passed.
- [ ] Native runtime service-boundary audit passed.
- [ ] Native command-contract audit passed.

Evidence:

```text
Record workflow names/run IDs or local command output summaries.
```

## Frontend quality

- [ ] `npm run docs:check`
- [ ] `npm run format`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run test:e2e:infra`
- [ ] `npm run test:e2e` in an unrestricted Chromium-compatible environment

Evidence:

```text
Record exact runtime versions and run identifiers.
```

## Parser fuzzing

- [ ] Bounded parser fuzz campaign completed on the candidate commit.
- [ ] No crash/invariant artifacts were produced, or every finding has a deterministic regression and fix.

Campaign details:

- Rust toolchain:
- cargo-fuzz version:
- Duration:
- Seed/corpus notes:
- Workflow/run ID:

## Benchmark evidence

- Hardware:
- Operating system:
- Node version:
- npm version:
- Rust version:
- Commit:

```text
Paste the complete benchmark output or link to the preserved run artifact.
```

Do not compare benchmark values without recording the machine/runtime context.

## Windows candidate

Artifact/checksum:

- [ ] Checksum matches `SHA256SUMS.txt`.
- [ ] Installs/launches successfully.
- [ ] Secure roll works.
- [ ] Seeded reference roll matches the web companion.
- [ ] Settings persist after restart.
- [ ] English/Hindi switching works after restart.
- [ ] Localized built-ins update without rewriting user-created content.
- [ ] Roll/history/probability presentation follows the selected locale.
- [ ] History CSV native save dialog works.
- [ ] History JSON native save dialog works.
- [ ] Backup native save dialog works.
- [ ] Native save-dialog cancellation creates no file and no failure state.
- [ ] Backup restore works from the exported candidate file.
- [ ] Reduced-motion behavior reviewed.
- [ ] Keyboard navigation reviewed.
- [ ] About/version/contact details reviewed.
- [ ] No private path/raw OS error is exposed by native export failure UI.

Evidence/notes:

```text
```

## macOS candidate

Artifact/checksum:

- [ ] Checksum matches `SHA256SUMS.txt`.
- [ ] Installs/launches successfully.
- [ ] Secure roll works.
- [ ] Seeded reference roll matches the web companion.
- [ ] Settings persist after restart.
- [ ] English/Hindi switching works after restart.
- [ ] Localized built-ins update without rewriting user-created content.
- [ ] Roll/history/probability presentation follows the selected locale.
- [ ] History CSV native save dialog works.
- [ ] History JSON native save dialog works.
- [ ] Backup native save dialog works.
- [ ] Native save-dialog cancellation creates no file and no failure state.
- [ ] Backup restore works from the exported candidate file.
- [ ] Reduced-motion behavior reviewed.
- [ ] Keyboard navigation reviewed.
- [ ] About/version/contact details reviewed.
- [ ] No private path/raw OS error is exposed by native export failure UI.

Signing/notarization status:

```text
State exactly what was performed. Do not call an unsigned/unnotarized artifact signed/notarized.
```

Evidence/notes:

```text
```

## Linux candidate

Artifact/checksum:

- [ ] Checksum matches `SHA256SUMS.txt`.
- [ ] Installs/launches successfully.
- [ ] Secure roll works.
- [ ] Seeded reference roll matches the web companion.
- [ ] Settings persist after restart.
- [ ] English/Hindi switching works after restart.
- [ ] Localized built-ins update without rewriting user-created content.
- [ ] Roll/history/probability presentation follows the selected locale.
- [ ] History CSV native save dialog works.
- [ ] History JSON native save dialog works.
- [ ] Backup native save dialog works.
- [ ] Native save-dialog cancellation creates no file and no failure state.
- [ ] Backup restore works from the exported candidate file.
- [ ] Reduced-motion behavior reviewed.
- [ ] Keyboard navigation reviewed.
- [ ] About/version/contact details reviewed.
- [ ] No private path/raw OS error is exposed by native export failure UI.

Evidence/notes:

```text
```

## Accessibility review

- [ ] Full primary journey completed with keyboard only.
- [ ] Focus is visible and logical.
- [ ] Command palette traps/restores focus correctly.
- [ ] Onboarding is usable by keyboard.
- [ ] 200% text scaling does not hide required controls/content.
- [ ] Reduced-motion preference removes nonessential movement.
- [ ] Screen-reader names identify primary controls and dialogs.
- [ ] English layout reviewed.
- [ ] Hindi layout reviewed.

Reviewer/platform/tool notes:

```text
```

## Real screenshots

Only candidate-build screenshots belong here.

- [ ] Dice Studio screenshot captured.
- [ ] History screenshot captured.
- [ ] Probability screenshot captured.
- [ ] Settings screenshot captured.
- [ ] Hindi interface screenshot captured.

Paths/links:

```text
```

## Release packaging and provenance

- [ ] Expected Windows/macOS/Linux/web artifacts are present.
- [ ] ZIP files are non-empty and inspect correctly.
- [ ] `RELEASE-METADATA.json` identifies the expected repository/tag/source commit/workflow run.
- [ ] `SHA256SUMS.txt` covers packaged artifact ZIPs and provenance metadata.
- [ ] Every published checksum was independently verified after download.
- [ ] Generated release notes were reviewed against `CHANGELOG.md`.
- [ ] Signing/notarization claims exactly match the produced artifacts.

Evidence:

```text
```

## Final decision

- [ ] No release blocker remains.
- [ ] All unchecked items are explicitly documented as non-blocking with rationale.
- [ ] `CHANGELOG.md` matches shipped behavior.
- [ ] `ROADMAP.md` reflects completed evidence.
- [ ] `what_changed.md` reflects the final candidate state.
- [ ] Draft release was reviewed before publication.

Decision:

```text
APPROVE / HOLD
```

Reviewer rationale:

```text
```
