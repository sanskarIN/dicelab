# DiceLab Automation Reference

This document explains every repository automation script and GitHub Actions workflow currently tracked by DiceLab. It distinguishes **configured automation** from **observed release evidence**: a workflow file proves that a check is defined, not that it has succeeded on a particular commit.

## 1. npm command surface

Commands are declared in `package.json`.

### Web and desktop development/build

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript project build/type checking and create the Vite production bundle |
| `npm run preview` | Serve the built production web bundle locally |
| `npm run tauri` | Invoke the Tauri CLI directly |
| `npm run tauri:dev` | Run the current-host desktop application in Tauri development mode |
| `npm run tauri:build` | Produce the current-host Tauri desktop bundle |

### Android

| Command | Purpose |
| --- | --- |
| `npm run tauri:android:init` | Generate/initialize the Tauri Android project under `src-tauri/gen/android` |
| `npm run tauri:android:dev` | Run the Android target against an emulator or connected device |
| `npm run tauri:android:build` | Build Android APK and AAB outputs; optional Tauri CLI target flags may further restrict ABI |

DiceLab's Tauri bundle configuration sets Android API 24 as the minimum supported Android level. Android development additionally requires the JDK, Android SDK/Build Tools/NDK, environment configuration, and Rust Android targets described in [`setup.md`](setup.md).

### iOS/iPadOS

| Command | Purpose |
| --- | --- |
| `npm run tauri:ios:init` | Generate/initialize the Tauri Apple project under `src-tauri/gen/apple` |
| `npm run tauri:ios:dev` | Run the iOS/iPadOS target from a macOS/Xcode development host |
| `npm run tauri:ios:build` | Run the normal Tauri iOS build flow; distribution builds require appropriate Apple signing |
| `npm run tauri:ios:build:ci` | Compile the Apple-Silicon iOS simulator target in CI without requiring an App Store distribution identity |
| `npm run tauri:ios:archive:ci` | Produce an unsigned ARM64 device archive validation build with the locked Tauri CLI |

DiceLab's Tauri bundle configuration sets iOS/iPadOS 14.0 as the minimum system version. Tauri iOS commands require a macOS/Xcode host.

### Formatting/linting/tests

| Command | Purpose |
| --- | --- |
| `npm run format` | Check Prettier formatting |
| `npm run format:write` | Rewrite files using Prettier |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run the Vitest suite with V8 coverage |
| `npm run bench` | Run Vitest benchmark files |

### Browser E2E

| Command | Purpose |
| --- | --- |
| `npm run test:e2e:infra` | Self-test the dependency-free CDP client and syntax-check the browser runner |
| `npm run test:e2e` | Drive the production web bundle through the real Chromium/CDP smoke journey |

`test:e2e` requires a production `dist/` and a compatible browser. See [`e2e.md`](e2e.md).

### Documentation

| Command | Purpose |
| --- | --- |
| `npm run docs:check` | Validate relative Markdown links/anchors using `scripts/check-doc-links.mjs` |
| `npm run docs:check:test` | Self-test the documentation link checker |
| `npm run docs:inventory` | Compare all Git-tracked files with the exhaustive repository file reference |
| `npm run docs:inventory:test` | Self-test the tracked-file/reference comparison logic |

### Security/repository policy

| Command | Purpose |
| --- | --- |
| `npm run security:secrets` | Scan the checked-out repository for high-confidence secrets/private-key material and tracked environment files |
| `npm run security:secrets:test` | Self-test the secret scanner without printing matched secret values |
| `npm run policy:capabilities` | Audit Tauri capability files for forbidden broad permission classes/window/origin scope |
| `npm run policy:tauri-security` | Audit Tauri CSP and remote-domain IPC configuration |
| `npm run policy:offline-csp` | Reject production remote network sources and broad network schemes while permitting explicit loopback-only development sources |
| `npm run policy:localized-formatting` | Ensure localized React surfaces use the shared formatting boundary |
| `npm run policy:runtime` | Ensure Tauri runtime probing/core imports stay in approved service adapters |
| `npm run policy:native-commands` | Audit renderer→Rust native command allowlist/routing synchronization |
| `npm run policy:lockfiles` | Check direct manifest/lock dependency consistency without regenerating lockfiles |
| `npm run policy:boundaries` | Aggregate capability/Tauri/localization/runtime repository boundary audits |
| `npm run policy:test` | Run synthetic and committed-source self-tests for policy auditors |
| `npm run policy:all` | Run aggregate boundaries plus offline CSP, native command, and lockfile consistency checks |

### Version/release helper commands

| Command | Purpose |
| --- | --- |
| `npm run version:check` | Verify package/config/generated-lock version agreement and optionally an expected release tag/version |
| `npm run version:check:test` | Self-test manifest/config/npm-lock/Cargo-lock version parsing and agreement logic |
| `npm run release:verify` | Verify prepared release packages/checksums/provenance when supplied with the expected release directory/context |
| `npm run release:verify:test` | Self-test the release package verifier |

## 2. Scripts directory — CDP browser automation

### `scripts/cdp-session.mjs`

Dependency-free Chrome DevTools Protocol transport used by the production browser smoke runner. It owns command IDs, pending command resolution/rejection, event subscriptions, timeout behavior, and socket/session shutdown handling.

### `scripts/cdp-session.test.mjs`

Node built-in tests for the CDP transport. Protects command routing, protocol errors, event waiting/timeouts, and socket closure independently of browser availability.

### `scripts/e2e-browser.mjs`

Starts/uses the production preview and drives a real Chromium-compatible browser through the primary web journey: onboarding, rolling, history, real downloads, reload persistence, command palette keyboard behavior, probability, local-data clearing, file input, and backup restoration.

## 3. Documentation audit scripts

### `scripts/check-doc-links.mjs`

Scans repository Markdown documents for relative links/anchors and fails when local targets are missing or malformed. External URL availability is intentionally a separate network-enabled release review.

### `scripts/check-doc-links.test.mjs`

Self-tests documentation link/anchor parsing and failure cases.

### `scripts/check-file-reference.mjs`

Runs `git ls-files -z`, parses the first-column path entries in `docs/repository-file-reference.md`, and reports:

- tracked files missing from the documentation inventory;
- documented paths that are no longer tracked.

This makes the “document every tracked file” rule executable. `src/mobile.css` is included in the exhaustive reference after the cross-platform expansion.

### `scripts/check-file-reference.test.mjs`

Self-tests file-table parsing plus missing/stale/synchronized comparisons.

### `scripts/check-file-reference.integration.test.mjs`

Runs the file-reference audit against the actual committed checkout/reference so repository drift is caught independently of synthetic tests.

## 4. Secret/version/release scripts

### `scripts/check-secrets.mjs`

Dependency-free high-confidence repository secret audit. It is designed to identify token/private-key style material and unsafe tracked environment files without printing matched secret values.

### `scripts/check-secrets.test.mjs`

Self-tests the scanner using safe synthetic fixtures/patterns.

### `scripts/check-version-sync.mjs`

Checks exact semantic-version agreement across:

- `package.json`;
- top-level `package-lock.json` version;
- `package-lock.json` root package (`packages[""]`) version;
- `src/config/app.ts`;
- `src-tauri/Cargo.toml`;
- the `dicelab` package entry in `src-tauri/Cargo.lock`;
- `src-tauri/tauri.conf.json`.

When `DICELAB_EXPECT_VERSION` is supplied, a conventional leading `v` is normalized and the expected tag/version must match the synchronized application version. A manifest bump therefore cannot pass while generated lock metadata still carries an older application version.

### `scripts/check-version-sync.test.mjs`

Self-tests frontend/Cargo manifest extraction, npm-lock top/root version extraction, Cargo-lock package extraction, end-of-file Cargo package-section parsing, semantic-version agreement, and tag agreement/error cases.

### `scripts/verify-release-packages.mjs`

Verifies generated release package/provenance/checksum structure. It is part of the draft-artifact review boundary rather than product runtime code.

### `scripts/verify-release-packages.test.mjs`

Self-tests the release verifier with synthetic package metadata/checksum scenarios.

## 5. Native capability policy scripts

### `scripts/check-capabilities.mjs`

Reads `src-tauri/capabilities/*.json` and rejects broad capability expansion such as filesystem, shell, HTTP, process, remote-origin, malformed permission, or wildcard-window scope.

The current `main` capability is explicitly scoped to Linux, macOS, Windows, Android, and iOS while retaining only `core:default`. Rust-side dialog/filesystem plugin use for the bounded export command does not grant renderer `fs:*` permissions.

### `scripts/check-capabilities.test.mjs`

Synthetic allow/deny policy cases.

### `scripts/check-capabilities.integration.test.mjs`

Runs the same policy against the actual committed capability directory.

## 6. Tauri security configuration scripts

### `scripts/check-tauri-security.mjs`

Audits `src-tauri/tauri.conf.json` for required CSP baseline, self anchoring, wildcard/`unsafe-eval` restrictions, remote script-source restrictions, and disabled remote-domain IPC. Packaged production policy remains strict; explicit `localhost`, `127.0.0.1`, and `[::1]` development URLs are permitted only in development CSP, while broad schemes and non-loopback remote origins remain rejected.

### `scripts/check-tauri-security.test.mjs`

Synthetic CSP/remote-IPC allow/deny cases, including the development-loopback versus production/remote-origin distinction.

### `scripts/check-tauri-security.integration.test.mjs`

Audits the committed Tauri security configuration.

## 7. Offline CSP scripts

### `scripts/check-offline-csp.mjs`

Checks production/development CSP directives for remote HTTP/HTTPS/WebSocket sources. Packaged production policy rejects remote network origins; development policy may contain only explicit supported loopback Vite/HMR URLs, not broad `http:`, `https:`, `ws:`, or `wss:` scheme sources or non-loopback origins.

### `scripts/check-offline-csp.test.mjs`

Synthetic loopback-development versus production/non-loopback/broad-scheme CSP source cases.

### `scripts/check-offline-csp.integration.test.mjs`

Audits the committed Tauri CSP for offline-network policy compliance.

## 8. Localization formatting policy scripts

### `scripts/check-localized-formatting.mjs`

Scans `src/App.tsx` and component TypeScript/TSX for direct host-locale APIs such as `toLocaleString()` or direct `Intl.NumberFormat`/`Intl.DateTimeFormat` construction. Localized UI values should flow through `src/i18n/format.ts`.

### `scripts/check-localized-formatting.test.mjs`

Synthetic allow/deny examples.

### `scripts/check-localized-formatting.integration.test.mjs`

Audits the actual committed localized UI source.

## 9. Native runtime policy scripts

### `scripts/check-runtime-boundaries.mjs`

Scans production TypeScript/TSX and restricts:

- `@tauri-apps/api/core` access to reviewed native service adapters;
- `__TAURI_INTERNALS__` probing to `src/services/runtime.ts`.

The same adapter boundary applies to Tauri desktop and mobile targets.

### `scripts/check-runtime-boundaries.test.mjs`

Synthetic approved/forbidden source-placement cases.

### `scripts/check-runtime-boundaries.integration.test.mjs`

Audits all committed production TypeScript/TSX.

## 10. Native command contract scripts

### `scripts/check-native-command-contract.mjs`

Keeps the frontend and Rust command surface synchronized. It rejects unknown/dynamic frontend command names, wrong adapter routing, and unapproved/missing/duplicate Rust handler entries.

Current allowlist:

```text
roll_expression
save_text_export
```

`save_text_export` is shared by Windows/macOS/Linux/Android/iOS builds. Platform-specific selected-path/URI behavior remains an implementation detail behind the Rust command.

### `scripts/check-native-command-contract.test.mjs`

Synthetic command-contract cases.

### `scripts/check-native-command-contract.integration.test.mjs`

Audits the committed frontend/Rust command surface.

## 11. Dependency lock policy scripts

### `scripts/check-lockfile-consistency.mjs`

Performs an early structural comparison:

- direct npm dependencies/devDependencies/optionalDependencies versus package-lock root metadata;
- direct Cargo dependencies/build/target dependencies versus package names present in Cargo.lock.

It detects stale/missing direct dependency lock coverage but deliberately does not synthesize Cargo's transitive graph or replace the separate version-agreement audit. After the mobile export change, the generated DiceLab Cargo package dependency list includes both `tauri-plugin-dialog` and `tauri-plugin-fs`.

### `scripts/check-lockfile-consistency.test.mjs`

Covers npm missing/stale/range mismatch cases, Cargo dependency-section parsing, aliases, package-name extraction, and missing direct crate detection.

## 12. Aggregate policy scripts

### `scripts/check-policy-boundaries.mjs`

Aggregates:

- capabilities;
- Tauri security config;
- localized formatting;
- native runtime boundary.

It prefixes findings with the policy name so one status can represent several architecture/security invariants.

### `scripts/check-policy-boundaries.integration.test.mjs`

Runs the aggregate policy against the committed repository.

## 13. GitHub workflow: `ci.yml`

**Triggers:** push to `main`, pull request targeting `main`.

### Web quality job

Runs:

1. secret scanner self-test;
2. repository secret audit;
3. E2E infrastructure self-test;
4. version audit self-test;
5. version consistency, including generated lock version metadata;
6. `npm ci`;
7. documentation link audit;
8. Prettier check;
9. ESLint;
10. Vitest unit/integration suite;
11. production web build;
12. real-browser E2E smoke.

### Rust quality job

On Ubuntu with Tauri Linux dependencies:

1. Rust stable + rustfmt/Clippy;
2. Rust build cache;
3. `cargo fmt --all -- --check`;
4. `cargo test --locked`;
5. `cargo clippy --all-targets --all-features --locked -- -D warnings`.

A stale generated lock blocks CI instead of being silently treated as synchronized.

### Android build job

On Ubuntu:

1. checkout source;
2. set up Node.js 22 with npm cache;
3. set up Java 17;
4. install Rust Android targets (`aarch64-linux-android`, `armv7-linux-androideabi`, `i686-linux-android`, `x86_64-linux-android`);
5. discover the latest installed Android NDK under the runner's `ANDROID_HOME/ndk` and export `NDK_HOME`;
6. run `npm ci`;
7. run `tauri android init` in CI mode without redundantly installing Rust targets;
8. build an ARM64 Android APK/AAB validation target.

This job proves native Android compilation only when an actual run succeeds. It does not replace physical-device/document-provider testing or Play signing.

### iOS simulator build job

On `macos-latest`:

1. checkout source;
2. set up Node.js 22 with npm cache;
3. install the `aarch64-apple-ios-sim` Rust target;
4. run `npm ci`;
5. run `tauri ios init` in CI mode;
6. compile the Apple-Silicon iOS simulator target.

The simulator job avoids requiring an App Store distribution identity. It does not replace physical iPhone/iPad testing or App Store signing.

## 14. GitHub workflow: `repository-audit.yml`

**Triggers:** every push/PR on `main`.

Runs dependency-free repository-level invariants before application dependency installation, including secret, documentation, E2E infrastructure, version, release-verifier, and exhaustive file-reference self-check/audit commands.

Because the version audit reads generated lock metadata, this workflow exposes a version bump whose lockfile metadata has not been regenerated.

## 15. GitHub workflow: `codeql.yml`

**Triggers:** `main` push, `main` pull request, weekly schedule.

Runs GitHub CodeQL JavaScript/TypeScript analysis with `security-events: write` permission and read-only repository content permission.

## 16. GitHub workflow: `npm-audit.yml`

**Triggers:** npm manifest/lock/workflow changes on push/PR, weekly schedule, manual dispatch.

Runs:

```text
npm ci --ignore-scripts
npm audit --audit-level=high
```

This is dependency-vulnerability evidence, not a substitute for CodeQL or application tests.

## 17. GitHub workflow: `fuzz.yml`

**Triggers:** weekly schedule, manual dispatch.

On Ubuntu:

- installs Tauri Linux system dependencies;
- installs Rust nightly;
- installs `cargo-fuzz --locked`;
- runs a bounded 60-second parser fuzz campaign.

A workflow definition is not a recorded green campaign until an actual run is observed on the intended candidate.

## 18. GitHub workflow: `lockfiles.yml`

**Triggers:** manual dispatch or changes on `main` to `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, or the workflow itself.

The job has a 20-minute timeout and a concurrency group so overlapping lockfile runs do not race each other.

Responsibilities:

1. checkout full history;
2. set up Node.js 22;
3. regenerate `package-lock.json` with `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`;
4. install stable Rust;
5. regenerate `src-tauri/Cargo.lock` with `cargo generate-lockfile`;
6. require `cargo metadata --locked --no-deps --format-version 1` to accept the generated Cargo lock against the manifest;
7. run the lock-aware `node scripts/check-version-sync.mjs` against generated locks and manifest/config versions;
8. run `git diff --check`;
9. commit only when one or both lockfiles changed;
10. rebase the generated commit on current `main`;
11. try to push the exact generated commit to `main`;
12. if direct push is rejected, force-publish that generated commit to `automation/lockfiles` for maintainer review/application.

The generated 2.0.12 lock state observed after the cross-platform change includes npm root version `2.0.12` and a DiceLab Cargo package at `2.0.12` with `tauri-plugin-dialog` and `tauri-plugin-fs` in its direct dependency list. Future manifest changes must regenerate the locks again; this observed state is not a permanent waiver of the lock policy.

## 19. GitHub workflow: `release.yml`

**Trigger:** `v*` tag push.

The current intended candidate tag is `v2.0.12`. The workflow verifies that the tag matches all machine-readable version locations, including generated lock metadata, before installing dependencies or producing artifacts.

### Web artifact job

The job has a 30-minute timeout and runs:

1. secret scanner self-test;
2. repository secret audit;
3. documentation link and tracked-file inventory self-tests;
4. documentation link and tracked-file inventory audits;
5. repository policy self-tests;
6. all release-relevant repository policy boundaries, including direct lock consistency;
7. browser E2E infrastructure self-test;
8. version audit self-test;
9. version/tag agreement across manifests/config/generated locks;
10. release-verifier self-test;
11. locked npm installation;
12. Prettier check;
13. ESLint;
14. Vitest unit/integration suite;
15. production web build;
16. real-browser E2E smoke;
17. web artifact upload.

### Desktop matrix

Runs on Windows, macOS, and Ubuntu with a 45-minute timeout per platform. Each platform:

- installs npm dependencies from the committed lockfile;
- verifies Rust formatting;
- runs locked Rust tests;
- runs Clippy with warnings denied and `--locked`;
- runs `npm run tauri:build`;
- uploads platform bundle output.

### Android release-validation job

Runs on Ubuntu with a 60-minute timeout:

- sets up Node 22, Java 17, Android Rust targets, and NDK environment;
- installs locked frontend dependencies;
- generates the Android project in CI mode;
- builds universal APK and AAB outputs;
- uploads them as an Android **unsigned/release-validation** artifact set.

Google Play publication remains a separate signing/Play Console step.

### iOS release-validation job

Runs on macOS with a 60-minute timeout:

- sets up Node 22 and the ARM64 iOS device Rust target;
- installs locked frontend dependencies;
- generates the Apple project in CI mode;
- runs the repository's unsigned archive-only Tauri build command;
- uploads the resulting `.xcarchive` as an **unsigned archive validation** artifact set.

The archive is not a store-ready signed IPA.

### Draft release job

Only after **web + desktop + Android + iOS** jobs succeed does a 15-minute draft-release job:

- download workflow artifacts;
- ZIP each artifact set;
- write `RELEASE-METADATA.json` containing repository/tag/source/workflow provenance;
- generate `SHA256SUMS.txt` covering ZIPs and metadata;
- create or update a **draft** GitHub release;
- upload packages/checksums.

It deliberately does not publish automatically. Installed-platform smoke, Android/iPhone/iPad physical-device checks, screenshots, accessibility, signing/notarization/store status, checksum/provenance review, and explicit maintainer approval remain release evidence.

## 20. Repository policy workflows

### `capability-audit.yml`

Runs capability auditor self-tests and audits committed native capability files on relevant changes/manual dispatch.

### `tauri-security-audit.yml`

Runs CSP/remote-IPC auditor tests and checks committed Tauri security configuration.

### `offline-csp-audit.yml`

Runs on relevant changes, pull requests, manual dispatch, and release tags to reject remote CSP network sources while retaining only the documented explicit loopback development exception.

### `localized-formatting-audit.yml`

Audits localized UI source to keep number/date/time presentation behind shared formatting helpers.

### `runtime-boundary-audit.yml`

Audits production frontend source for direct Tauri API/runtime-probe boundary violations.

### `native-command-contract.yml`

Audits command allowlist/routing and Rust handler synchronization on relevant source changes, pull requests, manual dispatch, and release tags.

### `repository-policy-audit.yml`

Provides one aggregate status for capability/Tauri/localization/runtime policies. It self-tests included auditors before auditing committed repository state.

### `release-policy-audits.yml`

Re-runs core repository policy boundaries on `v*` tags or manual dispatch. This reduces reliance on path-filtered PR workflows when evaluating a release tag.

### `release-lockfile-consistency.yml`

Runs lockfile auditor self-tests and actual manifest/lock dependency consistency on release tags/manual dispatch. It fails stale candidates rather than regenerating their dependency graph during release verification.

## 21. GitHub workflow: release-notes configuration

`.github/release.yml` is GitHub's generated-release-notes category configuration. It controls how merged pull requests/labels are grouped or excluded when release notes are generated; it is not the build workflow (which is `.github/workflows/release.yml`).

## 22. Dependabot

`.github/dependabot.yml` configures automated dependency-update discovery for the repository's supported package ecosystems/workflows. Dependabot proposals still require normal CI, lockfile, security, version, platform-compatibility, and generated-lock review.

## 23. Issue/PR automation metadata

These are not Actions workflows but influence repository process:

- `.github/CODEOWNERS` routes review responsibility, especially security/native/release files;
- `.github/ISSUE_TEMPLATE/*.yml` collects structured bug/feature/accessibility reports and routes security disclosure away from public issues;
- `.github/pull_request_template.md` asks contributors to record only checks they actually performed and review localization/accessibility/security/lockfile impacts;
- `.github/FUNDING.yml` exposes optional project-support metadata.

## 24. Mobile-generated projects

Tauri generates platform integration projects under `src-tauri/gen/android` and `src-tauri/gen/apple` during `tauri android init` / `tauri ios init`.

DiceLab treats these as generated platform tooling state rather than the source-of-truth product architecture. The shared source of truth remains:

- React/TypeScript application source under `src/`;
- Rust/Tauri native source under `src-tauri/src/`;
- Tauri configuration/capabilities;
- npm/Cargo manifests/locks;
- CI/release commands that regenerate the platform projects reproducibly.

Do not make an undocumented manual generated-project edit the only place where product behavior exists.

## 25. Evidence interpretation

Use the following distinction consistently.

### Configuration evidence

Examples:

- workflow YAML exists;
- Android/iOS command exists;
- mobile target configuration exists;
- test file exists;
- release template exists;
- audit command exists.

This proves the mechanism is defined.

### Execution evidence

Examples:

- workflow run ID and green conclusion;
- local command output on an identified commit/environment;
- Android/iOS compiler job conclusion;
- fuzz campaign result;
- benchmark output with machine/runtime metadata;
- installed candidate smoke result;
- physical-device Android/iPhone/iPad export/layout result;
- verified artifact checksum.

This proves a check was observed.

### Release evidence

Execution evidence must correspond to the intended release commit/tag/artifacts and be recorded in [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md).

Never convert configuration evidence into a completed evidence-gated roadmap checkbox without an observed run/review. Store signing/publication is an additional release boundary and must never be inferred solely from a successful unsigned mobile build.
