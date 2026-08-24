# Release Guide

DiceLab releases must be reproducible, reviewed, and based on one clean candidate commit with observed required checks.

## Current candidate

Current preparation target: **DiceLab 2.0.13**

```text
v2.0.13
```

The earlier 2.0.12 candidate was not published and is superseded. Do not create/publish `v2.0.13` until generated locks and all required candidate evidence are current for the same source commit.

## Supported release targets

- Windows desktop;
- macOS desktop;
- Linux desktop;
- Android API 24+;
- iOS/iPadOS 14.0+;
- modern-browser/ChromeOS installable PWA.

Native targets use Tauri 2; the browser target uses the production Vite bundle plus the guarded service worker.

## Version locations

Keep the application version aligned in:

- `package.json`;
- `package-lock.json` top-level version;
- `package-lock.json` `packages[""]` version;
- `src/config/app.ts`;
- `src-tauri/Cargo.toml`;
- DiceLab's package entry in `src-tauri/Cargo.lock`;
- `src-tauri/tauri.conf.json`.

Human release history belongs in `CHANGELOG.md`.

Verification:

```bash
npm run version:check:test
npm run version:check
```

The audit intentionally fails during a source-version bump until generated npm/Cargo lock metadata is regenerated.

## Dependency-lock rule

Every dependency-manifest or application-version change requires package-manager-generated lockfiles before the release commit is reproducible.

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
cd src-tauri
cargo generate-lockfile
cargo metadata --locked --format-version 1
cd ..
```

The repository lockfile workflow performs this regeneration automatically after relevant `main` changes and can also be manually dispatched. It commits the generated locks directly to `main` when allowed or publishes them to `automation/lockfiles` for review when branch protection blocks direct push.

Do not hand-edit Cargo's transitive graph or lock metadata merely to satisfy a version gate.

## 2.0.13 release prerequisites

Before tagging:

1. Confirm npm/Cargo generated lock metadata is 2.0.13 and matches current manifests.
2. Observe `npm run version:check` green on the exact candidate.
3. Observe normal web/Rust/Android/iOS CI green on that commit.
4. Observe the real-browser production E2E journey green.
5. Observe a bounded Rust parser fuzz campaign or explicitly record why it is excluded.
6. Record benchmark evidence with machine/runtime metadata.
7. Run/review secret, CodeQL, dependency, repository-policy, documentation-link, and exhaustive file-inventory checks.
8. Complete accessibility and English/Hindi review.
9. Build/smoke Windows, macOS, Linux, Android, iPhone, and iPad candidate paths as applicable.
10. Test native CSV/JSON/backup/preset-file save/cancel/failure paths.
11. Verify expression-level History analytics on representative large and filtered histories.
12. Verify exact probability threshold values and the accessible A/B comparison meter.
13. Verify repeated shared-preset import is idempotent and does not duplicate normalized content.
14. Verify locale/settings/history persistence and backup restore.
15. Capture real candidate screenshots.
16. Record actual signing/notarization/store readiness without overstating unsigned validation artifacts.
17. Update `CHANGELOG.md`, `ROADMAP.md`, `docs/release-blockers-current.md`, and `what_changed.md`.
18. Fill a candidate evidence record from [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md).

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
npm run bench

cd src-tauri
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

Benchmark output is evidence rather than a hard pass/fail gate; preserve environment details with it.

## Platform packaging

Desktop on the current host:

```bash
npm run tauri:build
```

Repeat on Windows/macOS/Linux.

Android:

```bash
npm run tauri:android:init
npm run tauri:android:build
```

The default command requests APK + AAB output. Native minimum is Android API 24.

iOS/iPadOS on macOS:

```bash
npm run tauri:ios:init
npm run tauri:ios:build
```

Unsigned CI validation:

```bash
npm run tauri:ios:build:ci
npm run tauri:ios:archive:ci
```

Simulator/unsigned archive output is build evidence, not an App Store-ready IPA.

## Browser/PWA evidence

`npm run test:e2e` operates on the production build and currently exercises:

- onboarding;
- rolling a custom expression;
- expression-level History analytics;
- real CSV download;
- reload persistence;
- keyboard command palette;
- exact probability expected value/median;
- exact A/B comparison and accessible comparison meter;
- backup download;
- clear-data flow;
- real file-input backup restore;
- service-worker control/cache state;
- generated Vite asset precaching;
- preview-server shutdown;
- cache-bypassing offline reopen with persisted history.

Final browser install/Add to Home Screen behavior still needs representative manual evidence because one Chromium journey cannot prove every browser/platform install UI.

## Native export evidence

The browser download path does not prove the native save path. On each applicable native candidate, test History CSV, History JSON, backup JSON, and preset JSON:

1. trigger output;
2. verify OS save/document dialog opens;
3. cancel and confirm no false error/output;
4. save and inspect content;
5. test a failure path and confirm generic localized feedback without a private path/URI/raw OS detail;
6. confirm the renderer still lacks broad filesystem/shell capability.

### Android

Verify system document-provider `content://` selections, cancellation, successful writes, and safe failure handling on physical hardware. Do not reintroduce desktop-path assumptions.

### iOS/iPadOS

Verify Files picker saves/cancellation, security-scoped access release, safe-area/orientation behavior, and persistence after returning from the picker.

See [`native-exports.md`](native-exports.md).

## Feature-specific 2.0.13 smoke

### History analytics

- roll at least two expressions multiple times;
- verify usage count/share reflects the active filtered collection;
- verify average/range values are plausible for each expression;
- filter History and confirm the analytics panel follows the filter;
- confirm the progressive roll-entry count still counts only roll articles;
- test narrow/mobile layout and a history with more than 12 distinct expressions.

### Probability comparison

- calculate representative ordinary and keep/drop expressions;
- verify P25/P50/P75 and standard deviation;
- change threshold and verify exact/at-most/at-least values update;
- compare A and B expressions;
- verify the three comparison probabilities sum to approximately 100%;
- verify the visual meter has three segments and its accessible label contains all three outcomes;
- enter an invalid B expression and confirm the last valid comparison remains visible.

### Shared presets

- export custom presets and confirm built-ins/local IDs/timestamps are absent;
- import the file and verify expressions are normalized;
- import the same file again and verify zero duplicate presets are added;
- verify differently named/described configurations remain distinct;
- verify oversized/invalid files fail safely;
- verify browser and native output paths separately.

## Localization/accessibility evidence

For both `en` and `hi` on representative desktop/mobile/browser layouts:

- switch locale and confirm shell/surface copy updates immediately;
- confirm document `lang` follows selection;
- confirm built-ins localize while user preset content remains unchanged;
- confirm locale-aware numbers/dates/times;
- restart and confirm preference persists;
- restore a backup and confirm supported locale restoration;
- test 200% text scaling, focus order/visibility, reduced motion, screen-reader landmarks/labels;
- include the new History analytics and A/B comparison meter in review.

## Signing/store distribution

Never store signing credentials, private keys, certificates, provisioning profiles, Android keystores, passwords, or store API credentials in the repository.

- Windows/macOS artifacts must state actual signing/notarization status.
- Google Play requires private Android signing and Play Console setup.
- App Store distribution requires Apple Developer/App Store Connect signing/provisioning.
- Current mobile workflow artifacts are release-validation outputs unless a separate reviewed signing flow has actually been configured.

## Tagging

Create the annotated tag only from the fully verified 2.0.13 commit:

```bash
git tag -a v2.0.13 -m "DiceLab v2.0.13"
git push origin v2.0.13
```

The tag workflow verifies policy/version/tests/E2E, builds web + desktop + Android + unsigned iOS validation artifacts, packages outputs, creates provenance/checksums, and creates/updates a **draft** GitHub release.

It intentionally does not auto-publish.

## Draft review

Before publication:

- verify every ZIP against `SHA256SUMS.txt`;
- inspect expected platform contents;
- verify `RELEASE-METADATA.json` tag/source/workflow identity;
- confirm final candidate CI/E2E/security evidence;
- confirm generated npm/Cargo application versions are 2.0.13;
- ensure generated notes agree with `CHANGELOG.md`;
- label unsigned/signed/notarized/archive/store-ready status accurately;
- attach only real candidate screenshots;
- keep the release draft if any blocker remains.

## Rollback

If a candidate fails after tagging but before publication, do not hide the failure. Keep/delete the draft as appropriate, fix on a new commit, bump/version according to release policy if the tag has escaped into public use, regenerate evidence, and only then approve a replacement candidate.

Canonical active blockers: [`release-blockers-current.md`](release-blockers-current.md).
