# Release Guide

DiceLab releases should be reproducible, reviewed, and based on a clean commit with passing required checks.

## Current candidate

The repository is currently preparing **DiceLab 2.18.12**. The intended release tag is:

```text
v2.18.12
```

Do not create or publish that tag until dependency locks and release-candidate evidence are current for the exact source commit.

## Supported release targets

The source tree now supports:

- Windows desktop;
- macOS desktop;
- Linux desktop;
- Android API 24+;
- iOS/iPadOS 14.0+;
- the modern-browser web companion/PWA.

Desktop and mobile native targets use Tauri 2. The web companion continues to use the Vite production bundle.

## Version locations

Keep the application version aligned in:

- `package.json`;
- the top-level `version` and `packages[""]` root version in generated `package-lock.json`;
- `src/config/app.ts`;
- `src-tauri/Cargo.toml`;
- DiceLab's generated package entry in `src-tauri/Cargo.lock`;
- `src-tauri/tauri.conf.json`.

Keep current release identity synchronized in:

- `README.md`;
- `ROADMAP.md`;
- the current candidate section in `CHANGELOG.md`;
- `docs/release.md`;
- `docs/release-blockers-current.md`;
- `docs/release-candidate-evidence-template.md`;
- `docs/lockfile-policy.md`;
- `what_changed.md`.

Use semantic-versioning principles. Compatibility-affecting changes must be documented clearly, especially on the 2.x version line.

The automated repository check verifies machine-readable metadata plus the current release-document identity markers:

```bash
npm run version:check:test
npm run version:check
```

The version audit intentionally fails when a manifest/config version has been bumped but generated npm/Cargo lock metadata is stale, or when the active release-facing documents still advertise a different candidate. Historical changelog/handoff sections may legitimately mention older versions; the audit protects only the current-candidate markers.

The lockfile generator uses the narrower metadata-only mode while it is producing generated files during a multi-commit version bump:

```bash
node scripts/check-version-sync.mjs --metadata-only
```

That mode is for generation only. Normal CI/release verification must use the full `npm run version:check` candidate audit.

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

The repository lockfile workflow can regenerate npm/Cargo lockfiles on `main` and `release/**` preparation branches and supports manual dispatch. It runs the metadata-only version audit while generating locks. If branch protection rejects a direct update, it publishes the exact generated commit to `automation/lockfiles` for `main` or a branch-specific `automation/lockfiles-*` fallback for a release branch. The existence of that workflow is not proof that the lockfile is current: inspect the resulting commit and observe locked checks before release.

Do not hand-edit transitive Cargo lock entries to bypass a stale-lock failure.

## Release prerequisites

Before tagging `v2.18.12`:

1. Ensure `package-lock.json` and `src-tauri/Cargo.lock` are generated and current for the exact manifests/version.
2. Verify `npm run version:check` reports manifest/config/generated-lock and current release-document identity as `2.18.12`.
3. Verify normal CI is green on the exact release commit, including web E2E, PWA/accessibility policy, locked Rust checks, Android build, and iOS simulator build.
4. Observe a bounded Rust parser fuzz campaign green on the intended candidate or record why it is excluded from the release gate.
5. Run the clean-checkout quality suite.
6. Run/review the repository secret audit and platform security alerts.
7. Review dependency/CodeQL findings.
8. Complete the accessibility smoke checklist.
9. Complete native CSV/JSON/backup save-dialog smoke checks on Windows, macOS, Linux, Android, and iOS candidate builds.
10. Capture real screenshots from verified desktop and mobile candidate builds.
11. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
12. Confirm the repository contains no credentials or generated signing secrets.
13. Confirm seeded web/native compatibility reference-vector tests pass.
14. Confirm English/Hindi locale selection and locale-aware presentation survive restart/backup restore.
15. Record release-candidate benchmark evidence with the machine/runtime metadata required by `docs/performance.md`.
16. Review repository settings against `docs/repository-governance.md`.
17. Record Android physical-device smoke evidence, including an OS document-provider export.
18. Record iPhone/iPad physical-device smoke evidence, including safe-area layout and an OS document-picker export.
19. If publishing to Google Play or the App Store, separately verify store signing and store-account configuration.

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
npm run policy:pwa:test
npm run policy:pwa
npm run policy:accessibility:test
npm run policy:accessibility
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

## Platform packaging commands

Desktop bundle on the current host:

```bash
npm run tauri:build
```

Repeat desktop packaging on Windows, macOS, and Linux because native bundles are platform-specific.

Android generation/build:

```bash
npm run tauri:android:init
npm run tauri:android:build
```

The default repository Android build requests APK and AAB output. The Tauri configuration sets Android API 24 as the minimum supported version.

iOS generation/build on macOS:

```bash
npm run tauri:ios:init
npm run tauri:ios:build
```

CI has two non-store-signing validation modes:

```bash
npm run tauri:ios:build:ci
npm run tauri:ios:archive:ci
```

The first compiles the Apple Silicon simulator target. The second uses the locked Tauri CLI's unsigned archive mode for a device-target archive. Neither should be described as an App Store-ready signed IPA.

## Browser E2E release evidence

The production web build is not release-ready merely because Vitest/jsdom passes. The real-browser smoke must be observed successfully on the release commit.

It verifies onboarding, rolling, history, real CSV download, reload persistence, command-palette keyboard behavior, probability calculation, real backup download, local-data clearing, real file-input restore, restored history, production service-worker control, generated runtime precaching, and a server-offline reopen with persisted state.

Do not weaken browser/security policy merely to manufacture local release evidence.

## Native export release evidence

The web companion's browser-download test does not validate Tauri's native save path. Each native candidate must independently prove its native flow.

For History CSV, History JSON, and backup export:

1. Trigger the export from the packaged/native candidate.
2. Confirm the operating-system save/document dialog opens.
3. Cancel once and confirm no file is created and no error is shown.
4. Save once using the expected extension and verify the resulting content.
5. Verify a deliberately unavailable destination/provider fails with generic localized UI feedback rather than a private path/raw operating-system error.
6. Confirm the webview has not gained broad filesystem or shell capability.
7. Confirm the selected/suggested file format remains consistent with the requested `csv`/`json` format.

### Android-specific export evidence

Android document providers can return `content://` selections rather than ordinary filesystem paths. The native command uses `tauri-plugin-fs` to open the selected `FilePath`; do not reintroduce `std::fs` assumptions for these URIs.

Test at least:

- local device Documents/Downloads provider;
- cancellation;
- CSV and JSON writes;
- reopening the saved file outside DiceLab where supported;
- a provider failure path with user-safe feedback.

External/cloud document-provider behavior can differ by vendor and OS build, so physical-device evidence remains required even after compiler CI passes.

### iOS-specific export evidence

The iOS file picker can grant security-scoped access. DiceLab releases that access after writing. Test at least:

- Files picker save;
- cancellation;
- CSV and JSON writes;
- an iPhone-sized layout with safe-area insets;
- an iPad-sized layout/orientation;
- persistence/restart after returning from the picker.

See [`native-exports.md`](native-exports.md) for the implementation trust boundary.

## Localization release evidence

For both `en` and `hi` on representative desktop, phone, tablet, and browser candidates:

- switch locale from Settings and confirm navigation/surface copy changes immediately;
- confirm document language metadata follows the selection;
- confirm built-in presets localize while user-created copy remains unchanged;
- confirm roll/history/probability numbers and dates/times use the selected locale formatting;
- restart and confirm the preference persists;
- export/import a backup and confirm the supported locale is restored;
- check narrow layouts and 200% text scaling for clipping/overlap.

## Signing and store distribution

Signing credentials are deployment secrets. Never store private keys, certificates, passwords, provisioning profiles, Android keystores, or store API credentials in the repository.

### Desktop

Windows and macOS distribution should use the platform signing/notarization process when credentials are available. Unsigned artifacts must be labeled accurately.

### Android / Google Play

Google Play distribution requires an Android signing keystore and Play Console application registration. The first Play upload must be handled according to Google/Tauri distribution requirements. The repository release workflow intentionally emits **release-validation artifacts** unless a future reviewed signing path is explicitly added.

### iOS / App Store

End-user iOS/App Store distribution requires Apple Developer enrollment, the registered `in.sanskar.dicelab` identifier, a suitable distribution certificate/provisioning profile or App Store Connect automatic-signing credentials, and a signed export. The current repository release workflow emits an **unsigned `.xcarchive` validation artifact**, not a store-ready IPA.

If signing is later configured through CI, use repository/environment secrets and least-privilege permissions. A release without configured signing must be described accurately; do not claim artifacts are signed when they are not.

## Tagging

Create the annotated version tag only from the verified 2.18.12 release commit:

```bash
git tag -a v2.18.12 -m "DiceLab v2.18.12"
git push origin v2.18.12
```

The tag-driven release workflow then:

1. runs secret-audit self-tests and the repository secret audit;
2. runs documentation link and exhaustive tracked-file inventory self-tests/audits;
3. runs repository policy self-tests and release-relevant policy boundaries, including lockfile, PWA, and accessibility consistency;
4. runs browser E2E infrastructure, version-audit, and release-verifier self-tests;
5. verifies the tag agrees with manifest/config/generated-lock version metadata and current release-document identity;
6. installs locked npm dependencies;
7. runs format, lint, unit/integration, production-build, and real-browser E2E checks;
8. builds Windows, macOS, and Linux desktop bundles after locked Rust checks;
9. initializes/builds universal Android APK/AAB validation artifacts on Ubuntu;
10. initializes/builds an unsigned iOS ARM64 device archive on macOS;
11. uploads each successful platform artifact to the workflow run;
12. downloads only artifacts produced by successful prerequisite jobs;
13. creates a ZIP per artifact set;
14. generates `RELEASE-METADATA.json` and `SHA256SUMS.txt` for packages/provenance;
15. creates or updates a **draft** GitHub release and uploads the packages/checksums.

The workflow deliberately leaves the release as a draft. A human maintainer must still install/smoke-test produced bundles, complete physical Android/iOS evidence, verify signing status, inspect localization/native save dialogs, and review generated notes before publishing.

## Draft release review

Before publishing the draft:

- download each uploaded ZIP and compare its SHA-256 digest with `SHA256SUMS.txt`;
- extract and inspect expected platform files;
- complete the artifact smoke matrix below;
- verify the exact release commit had green CI/E2E/CodeQL/security/mobile-build evidence;
- verify both generated lockfiles carry the 2.18.12 application version and the Cargo lock includes all direct Rust dependencies declared by the candidate manifest;
- replace or edit generated notes so they accurately match `CHANGELOG.md`;
- clearly state whether artifacts are unsigned, signed, notarized, simulator-only, archive-only, or store-ready;
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
- supported platform/minimum-version information;
- known limitations;
- upgrade or backup-schema notes;
- platform-specific caveats;
- checksums/signing information when actually produced.

Do not describe planned functionality as shipped functionality.

## Artifact verification

For each produced native bundle/archive:

1. Confirm the expected file exists and is non-empty.
2. Verify the ZIP digest against `SHA256SUMS.txt`.
3. Install or launch it on the intended supported platform where the artifact type permits.
4. Complete a secure roll and a seeded roll.
5. Compare a documented seeded reference case with the web companion.
6. Verify settings, including locale, persist after restart.
7. Export History CSV/JSON through the native save/document dialog.
8. Export a backup and restore it.
9. Verify English/Hindi selection, document language, localized built-ins, and presentation formatting.
10. Verify About/version/contact information reports `2.18.12`.
11. Confirm the build contains no development server references.
12. Verify reduced-motion and keyboard/touch navigation behavior appropriate to the platform.
13. Confirm local diagnostic logging does not expose user-created content/seeds/raw errors.
14. Confirm native export errors do not expose private selected paths/URIs.
15. On phones/tablets, verify safe-area and orientation behavior.
16. Capture screenshots only after the artifact passes this matrix.

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
