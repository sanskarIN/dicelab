# Release Guide

DiceLab releases should be reproducible, reviewed, and based on a clean commit with passing required checks.

## Version locations

Keep the version aligned in:

- `package.json`
- `src/config/app.ts`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `CHANGELOG.md`

Use semantic-versioning principles. During pre-1.0 development, minor releases may still include deliberate compatibility changes when documented clearly.

The automated repository check verifies the executable/configuration locations:

```bash
npm run version:check:test
npm run version:check
```

`CHANGELOG.md` is intentionally reviewed by a maintainer rather than parsed as an executable version source because the unreleased/planned sections can legitimately mention multiple versions.

## Release prerequisites

Before tagging a release:

1. Ensure `package-lock.json` and `src-tauri/Cargo.lock` are committed and current.
2. Verify normal CI is green on the exact release commit, including real-browser E2E.
3. Run the clean-checkout quality suite.
4. Run/review the repository secret audit and platform security alerts.
5. Review dependency/CodeQL findings.
6. Complete the accessibility smoke checklist.
7. Capture real screenshots from the release candidate.
8. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
9. Verify every executable/configuration version location matches with `npm run version:check`.
10. Confirm the repository contains no credentials or generated signing secrets.
11. Confirm seeded web/desktop compatibility reference-vector tests pass.
12. Record release-candidate benchmark evidence with the machine/runtime metadata required by `docs/performance.md`.
13. Review repository settings against `docs/repository-governance.md`.

## Clean-checkout verification

From a new clone:

```bash
git clone https://github.com/sanskarIN/dicelab.git
cd dicelab

npm run security:secrets:test
npm run security:secrets
npm run test:e2e:infra
npm run version:check:test
npm run version:check
npm ci
npm run docs:check
npm run format
npm run lint
npm run test
npm run build
npm run test:e2e

cd src-tauri
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
cd ..
```

The pre-install Node checks intentionally use only built-in Node APIs. `npm run test:e2e` requires the production `dist/` created by `npm run build` and a Chromium-compatible browser. Set `CHROME_BIN` if auto-discovery cannot find Chrome/Chromium. See [`e2e.md`](e2e.md).

Run performance measurements separately because timing output is evidence rather than a hard pass/fail gate:

```bash
npm run bench
```

Desktop packaging:

```bash
npm run tauri:build
```

Repeat packaging on Windows, macOS, and Linux because native bundles are platform-specific.

## Browser E2E release evidence

The production web build is not release-ready merely because Vitest/jsdom passes. The real-browser smoke must be observed successfully on the release commit.

It verifies onboarding, rolling, history, real CSV download, reload persistence, command-palette keyboard behavior, probability calculation, real backup download, local-data clearing, real file-input restore, and restored history.

The August 19, 2026 execution container used during hardening has Chromium installed but its administrator policy blocks loopback navigation with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. That environment therefore cannot provide full-browser pass evidence. The E2E infrastructure transport tests passed there; the complete journey must still be observed on GitHub Actions or another environment that permits loopback browser navigation.

Do not weaken browser/security policy merely to manufacture local release evidence.

## Signing and notarization

Signing credentials are deployment secrets. Never store private keys, certificates, passwords, or notarization credentials in the repository.

If signing is configured through CI, use repository/environment secrets and least-privilege permissions. A release without configured signing must be described accurately; do not claim artifacts are signed when they are not.

## Tagging

Create an annotated version tag from the verified commit, for example:

```bash
git tag -a v0.1.0 -m "DiceLab v0.1.0"
git push origin v0.1.0
```

The tag-driven release workflow then:

1. runs secret-audit, E2E-infrastructure, and version-audit self-checks before dependency installation;
2. verifies the repository secret scan and version consistency;
3. runs documentation, format, lint, unit/integration, production-build, and real-browser E2E checks with locked npm dependencies;
4. builds Windows, macOS, and Linux desktop bundles after locked Rust tests/Clippy checks;
5. uploads each platform artifact to the workflow run;
6. downloads only artifacts produced by successful prerequisite jobs;
7. creates a ZIP per artifact set;
8. generates `SHA256SUMS.txt` for the ZIP files;
9. creates or updates a **draft** GitHub release for the tag and uploads the packages/checksums.

The workflow deliberately leaves the release as a draft. A human maintainer must still install/smoke-test the produced bundles and review generated notes before publishing.

## Draft release review

Before publishing the draft:

- download each uploaded ZIP and compare its SHA-256 digest with `SHA256SUMS.txt`;
- extract and inspect expected platform files;
- complete the artifact smoke matrix below;
- verify the exact release commit had green CI/E2E/CodeQL/security evidence;
- replace or edit generated notes so they accurately match `CHANGELOG.md`;
- clearly state whether artifacts are unsigned, signed, notarized, or otherwise platform-verified;
- attach release screenshots only if they come from the candidate build;
- keep the release draft if any blocker remains.

## Release notes

Release notes should contain:

- user-visible additions and fixes;
- security/privacy changes;
- accessibility changes;
- deterministic RNG compatibility changes;
- validation/backup compatibility changes;
- known limitations;
- upgrade or backup-schema notes;
- platform-specific caveats;
- checksums/signing information when actually produced.

Do not describe planned functionality as shipped functionality.

## Artifact verification

For each produced bundle:

1. Confirm the expected file exists and is non-empty.
2. Verify the ZIP digest against `SHA256SUMS.txt`.
3. Install or launch it on the intended platform.
4. Complete a secure roll and a seeded roll.
5. Compare a documented seeded reference case with the web companion.
6. Verify settings persist after restart.
7. Export a backup and restore it.
8. Verify About/version/contact information.
9. Confirm the build contains no development server references.
10. Verify reduced-motion and keyboard navigation behavior.
11. Confirm local diagnostic logging does not expose user-created content/seeds/raw errors.
12. Capture screenshots only after the artifact passes this matrix.

## Rollback

If a release has a serious defect:

- mark the affected release clearly;
- publish a fixed patch release from a reviewed commit;
- document the affected versions and workaround where appropriate;
- never rewrite a published release tag to hide history.

## Release ownership

Project/business contact: `sanskarin@outlook.in`

Support: `supportramsandesh@gmail.com`

**Made by the Sanskar**
