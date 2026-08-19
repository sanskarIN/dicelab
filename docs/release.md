# Release Guide

DiceLab releases should be reproducible, reviewed, and based on a clean commit with passing required checks.

## Current candidate

The repository is currently preparing **DiceLab 2.0.12**. The intended release tag is:

```text
v2.0.12
```

Do not create or publish that tag until the dependency locks and release-candidate evidence described below are current for the exact source commit.

## Version locations

Keep the application version aligned in:

- `package.json`;
- the top-level `version` and `packages[""]` root version in generated `package-lock.json`;
- `src/config/app.ts`;
- `src-tauri/Cargo.toml`;
- DiceLab's generated package entry in `src-tauri/Cargo.lock`;
- `src-tauri/tauri.conf.json`;
- `CHANGELOG.md` as the human-reviewed release record.

Use semantic-versioning principles. Compatibility-affecting changes must be documented clearly, especially on the 2.x version line.

The automated repository check verifies the six machine-readable sources plus both npm-lock version locations:

```bash
npm run version:check:test
npm run version:check
```

The version audit intentionally fails when a manifest/config version has been bumped but generated npm/Cargo lock metadata has not yet been regenerated. `CHANGELOG.md` remains a maintainer-reviewed source rather than an executable version input because unreleased/released sections can legitimately mention multiple versions.

## Dependency-lock rule

Every dependency-manifest or application-version change must be accompanied by corresponding generated lockfiles before the release commit is considered reproducible.

- `package.json` changes require a current `package-lock.json`.
- `src-tauri/Cargo.toml` changes require a current `src-tauri/Cargo.lock`.

Regenerate npm metadata from the repository root:

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
```

For Rust, regenerate from `src-tauri`:

```bash
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

The repository lockfile workflow can regenerate npm/Cargo lockfiles and supports manual dispatch. If branch protection rejects its direct `main` update, it is configured to publish the exact generated commit to `automation/lockfiles` for review/application. The existence of that workflow is not proof that the lockfile is current: inspect the resulting commit and observe locked checks before release.

Do not hand-edit transitive Cargo lock entries to bypass a stale-lock failure.

## Release prerequisites

Before tagging `v2.0.12`:

1. Ensure `package-lock.json` and `src-tauri/Cargo.lock` are generated and current for the exact manifests/version.
2. Verify `npm run version:check` reports all manifest/config/generated-lock version locations as `2.0.12`.
3. Verify normal CI is green on the exact release commit, including real-browser E2E.
4. Observe a bounded Rust parser fuzz campaign green on the intended candidate or record why it is excluded from the release gate.
5. Run the clean-checkout quality suite.
6. Run/review the repository secret audit and platform security alerts.
7. Review dependency/CodeQL findings.
8. Complete the accessibility smoke checklist.
9. Complete native desktop CSV/JSON/backup save-dialog smoke checks on candidate builds.
10. Capture real screenshots from the release candidate.
11. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
12. Confirm the repository contains no credentials or generated signing secrets.
13. Confirm seeded web/desktop compatibility reference-vector tests pass.
14. Confirm English/Hindi locale selection and locale-aware presentation survive restart/backup restore.
15. Record release-candidate benchmark evidence with the machine/runtime metadata required by `docs/performance.md`.
16. Review repository settings against `docs/repository-governance.md`.

## Clean-checkout verification

From a new clone:

```bash
git clone https://github.com/sanskarIN/dicelab.git
cd dicelab

npm run security:secrets:test
npm run security:secrets
npm run docs:check:test
npm run docs:check
npm run docs:inventory:test
npm run docs:inventory
npm run policy:test
npm run policy:all
npm run test:e2e:infra
npm run version:check:test
npm run version:check
npm run release:verify:test
npm ci
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

## Native desktop export release evidence

The web companion's browser-download test does not validate Tauri's native save path. Each Windows/macOS/Linux candidate must independently prove the native flow.

For History CSV, History JSON, and backup export:

1. Trigger the export from the packaged candidate.
2. Confirm the operating-system save dialog opens.
3. Cancel once and confirm no file is created and no error is shown.
4. Save once using the expected extension and verify the resulting content.
5. Verify a deliberately unavailable/unwritable destination fails with generic localized UI feedback rather than a private filesystem path/raw operating-system error.
6. Confirm the webview has not gained broad filesystem or shell capability.
7. Confirm the selected file extension remains consistent with the requested `csv`/`json` format.

See [`native-exports.md`](native-exports.md) for the implementation trust boundary.

## Localization release evidence

For both `en` and `hi` on a candidate build:

- switch locale from Settings and confirm navigation/surface copy changes immediately;
- confirm document language metadata follows the selection;
- confirm built-in presets localize while user-created copy remains unchanged;
- confirm roll/history/probability numbers and dates/times use the selected locale formatting;
- restart and confirm the preference persists;
- export/import a backup and confirm the supported locale is restored;
- check narrow layouts and 200% text scaling for clipping/overlap.

## Signing and notarization

Signing credentials are deployment secrets. Never store private keys, certificates, passwords, or notarization credentials in the repository.

If signing is configured through CI, use repository/environment secrets and least-privilege permissions. A release without configured signing must be described accurately; do not claim artifacts are signed when they are not.

## Tagging

Create the annotated version tag only from the verified 2.0.12 release commit:

```bash
git tag -a v2.0.12 -m "DiceLab v2.0.12"
git push origin v2.0.12
```

The tag-driven release workflow then:

1. runs secret-audit self-tests and the repository secret audit;
2. runs documentation link and exhaustive tracked-file inventory self-tests/audits;
3. runs repository policy self-tests and all release-relevant policy boundaries, including lockfile consistency;
4. runs browser E2E infrastructure, version-audit, and release-verifier self-tests;
5. verifies tag `v2.0.12` agrees with manifest/config/generated-lock version metadata;
6. installs locked npm dependencies;
7. runs format, lint, unit/integration, production-build, and real-browser E2E checks;
8. builds Windows, macOS, and Linux desktop bundles after locked Rust formatting/tests/Clippy checks;
9. uploads each platform artifact to the workflow run;
10. downloads only artifacts produced by successful prerequisite jobs;
11. creates a ZIP per artifact set;
12. generates `RELEASE-METADATA.json` and `SHA256SUMS.txt` for the packages/provenance;
13. creates or updates a **draft** GitHub release for the tag and uploads the packages/checksums.

The web, desktop, and draft-release jobs use explicit timeouts so a stuck release path cannot remain indefinitely active. The workflow deliberately leaves the release as a draft. A human maintainer must still install/smoke-test the produced bundles, verify native save dialogs/localization, and review generated notes before publishing.

## Draft release review

Before publishing the draft:

- download each uploaded ZIP and compare its SHA-256 digest with `SHA256SUMS.txt`;
- extract and inspect expected platform files;
- complete the artifact smoke matrix below;
- verify the exact release commit had green CI/E2E/CodeQL/security evidence;
- verify both generated lockfiles carry the 2.0.12 application version and the Cargo lock includes all direct Rust dependencies declared by the candidate manifest;
- replace or edit generated notes so they accurately match `CHANGELOG.md`;
- clearly state whether artifacts are unsigned, signed, notarized, or otherwise platform-verified;
- attach release screenshots only if they come from the candidate build;
- keep the release draft if any blocker remains.

## Release notes

Release notes should contain:

- user-visible additions and fixes;
- security/privacy changes;
- accessibility changes;
- localization changes;
- deterministic RNG compatibility changes;
- validation/backup compatibility changes;
- native export behavior or limitations;
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
6. Verify settings, including locale, persist after restart.
7. Export History CSV/JSON through the native save dialog.
8. Export a backup through the native save dialog and restore it.
9. Verify English/Hindi selection, document language, localized built-ins, and presentation formatting.
10. Verify About/version/contact information reports `2.0.12`.
11. Confirm the build contains no development server references.
12. Verify reduced-motion and keyboard navigation behavior.
13. Confirm local diagnostic logging does not expose user-created content/seeds/raw errors.
14. Confirm native export errors do not expose private selected paths.
15. Capture screenshots only after the artifact passes this matrix.

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
