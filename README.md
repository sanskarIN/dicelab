# DiceLab

<p align="center">
  <img src="src-tauri/icons/icon.png" alt="DiceLab logo" width="128" height="128" />
</p>

<p align="center"><strong>A polished, offline-first cross-platform dice simulator for tabletop play, testing, teaching, and probability exploration.</strong></p>

<p align="center">
  <a href="https://github.com/sanskarIN/dicelab/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/sanskarIN/dicelab/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://buymeacoffee.com/sanskarIN"><img alt="Buy Me a Coffee" src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000" /></a>
</p>

## Why DiceLab?

DiceLab goes beyond a one-button dice demo. It combines expressive dice notation, secure and cross-runtime reproducible randomness modes, roll history, statistics, presets, exports, exact probability tools, hardened local persistence, localization, accessibility, installable offline web support, and release-focused engineering in one codebase targeting desktop, mobile, and the web. It remains useful without an account or network connection.

## Current release status

The repository is preparing **DiceLab 2.18.12** with intended tag `v2.18.12`. Application manifests/configuration and generated npm/Cargo lock metadata are synchronized to 2.18.12, including the direct mobile filesystem dependency. The source contains Windows, macOS, Linux, Android, iOS/iPadOS, and installable browser/PWA build paths. The candidate is **not yet publishable** until the required CI, browser/PWA, mobile, fuzz, platform, accessibility, security, screenshot, signing-status, checksum, and provenance evidence are observed for the same final candidate commit.

`npm run version:check` verifies application-version agreement across npm/frontend/Cargo/Tauri metadata and generated lockfile package versions. `npm run policy:lockfiles` independently checks direct manifest/lock consistency. Current evidence blockers are maintained in [`docs/release-blockers-current.md`](docs/release-blockers-current.md).

## Screenshots

Real release screenshots will be captured from verified release-candidate builds. Until then, the repository intentionally avoids mock screenshots that could misrepresent the shipping UI.

| View | What it provides |
| --- | --- |
| Dice Studio | Quick d4/d6/d8/d10/d12/d20/d100 choices, custom expressions, reusable presets, shareable local preset files, and result details |
| History | Searchable local roll log, statistics, histogram, progressive large-list rendering, CSV/JSON export |
| Probability | Exact distributions, expected values, quartiles, standard deviation, threshold probabilities, and pairwise expression comparison with explicit complexity/precision limits |
| Settings | Theme, English/Hindi language, reduced motion, secure/seeded mode, history retention, backup, release/version, and About access |
| About | Privacy, license, project links, support contacts, funding, version, and credits |

## Features

- d4, d6, d8, d10, d12, d20, d100, and custom-sided dice up to documented safety limits.
- Multiple dice, signed modifiers, and `kh`, `kl`, `dh`, and `dl` keep/drop expressions.
- Native secure random mode backed by the operating system through Rust, with Web Crypto in the web companion.
- Deterministic seeded mode with matching TypeScript/Rust reference vectors for cross-runtime reproducibility.
- Offline-first local history, saved tabletop presets, statistics, and observed histograms.
- Installable production PWA for compatible browsers and ChromeOS, with a versioned same-origin offline application shell and dedicated Android/iOS home-screen assets.
- Progressive rendering for large retained histories while statistics and exports still use the full filtered data set.
- Reusable domain history filtering for expression/total queries.
- Exact probability distributions for normal sums and manageable keep/drop pools, with safe-integer exactness guards.
- CSV and JSON roll-log export plus validated JSON backup/restore.
- Cross-platform native save/document dialogs through a dedicated bounded Rust command, with ordinary browser downloads retained for the web companion.
- Android `content://` export support through Tauri's filesystem abstraction instead of desktop-only path assumptions.
- iOS security-scoped selected-file handling with explicit access release after native writes.
- Spreadsheet-safe CSV handling for formula-like user-controlled cells.
- Stable parser/probability/backup error codes mapped to localized user-facing messages.
- Reviewed English and Hindi interface catalogs with a persisted language preference, localized built-in presets, backup compatibility, document-language metadata, and explicit locale-aware number/date/time formatting.
- Light, dark, and system themes.
- Reduced-motion and non-animation modes with normalized persisted settings.
- Keyboard command palette (`Ctrl/⌘ K`) with modal focus trapping/restoration, exposed dialog/shortcut semantics, and keyboard-first navigation.
- Responsive desktop/tablet/phone/web UI with safe-area insets, dynamic viewport handling, touch-sized coarse-pointer targets, accessible labels, focus styles, scalable layouts, and non-color-only states.
- Dependency-free accessibility policy checks that protect high-value skip-link, landmark, navigation, dialog, focus, live-region, validation, Settings, and focus-visible source invariants.
- Structured local diagnostic logging with sensitive-key redaction, bounded context, and raw-error omission.
- Coverage-guided Rust parser fuzz target with a bounded scheduled/manual GitHub Actions campaign.
- Dependency-free high-confidence secret audit in normal CI and tagged release verification.
- Dependency-free PWA integrity audit covering install metadata, local icon assets, cache boundaries, production-only registration, and Tauri exclusion.
- Dependency-free Node 22 + Chromium CDP real-browser E2E smoke for the production web bundle.
- Executable benchmark suites for parser, RNG, probability, history filtering, and statistics.
- Automated architecture/security policy gates for Tauri capabilities, CSP/offline network sources, localized formatting, runtime boundaries, native command contracts, accessibility semantics, PWA boundaries, and direct dependency-lock consistency.
- Exhaustive tracked-file documentation inventory checked against `git ls-files` so new repository files cannot be silently omitted from the file reference.
- Automated version synchronization checks across npm/frontend/Cargo/Tauri metadata **and generated npm/Cargo lock package versions**, plus tag/version agreement on releases.
- Main CI validates web quality/PWA/accessibility integrity, locked Rust quality, Android ARM64 native compilation, and an Apple Silicon iOS simulator build.
- Tag-driven releases gate artifact creation on documentation inventory, repository policy, lock/version consistency, tests, real-browser E2E, locked Rust checks, Windows/macOS/Linux bundles, Android APK/AAB validation artifacts, and an unsigned iOS device archive.
- Release provenance metadata and SHA-256 checksums for draft artifact review.
- No required sign-in, analytics service, advertising SDK, remote telemetry, or donation gate.

## Supported platforms

| Platform | Native/web target | Minimum / notes |
| --- | --- | --- |
| Windows | Tauri 2 desktop application | Platform Tauri/WebView2 prerequisites apply |
| macOS | Tauri 2 desktop application | Platform Tauri/WebKit prerequisites apply |
| Linux | Tauri 2 desktop application | WebKitGTK/native package prerequisites apply |
| Android | Tauri 2 mobile application + compatible-browser PWA | Android API 24+ for native; browser install support varies by browser/version |
| iOS / iPadOS | Tauri 2 mobile application + home-screen web app | iOS/iPadOS 14.0+ for native; native builds require macOS/Xcode |
| ChromeOS | Installable production PWA | Compatible standards-based browser/PWA environment |
| Modern browsers | React/Vite production PWA/web companion | HTTPS deployment (or localhost for local verification) and required Web APIs |

The repository therefore has a single product codebase for **Windows + macOS + Linux + Android + iOS/iPadOS + ChromeOS/Web**. Store publication is a separate signing/distribution concern: the mobile source/build targets exist now, while Google Play/App Store publishing still requires private developer credentials and physical-device release evidence. Browser install UI is controlled by the browser/operating system and must be verified on the final deployed candidate.

## Tech stack

- **Native core:** Rust + Tauri 2
- **Native plugins:** Tauri dialog + filesystem abstractions for reviewed cross-platform export handling
- **Frontend:** TypeScript + React + Vite
- **Web install/offline:** standards-based web manifest + guarded production service worker + local PWA icon set
- **Localization:** typed in-repository English/Hindi catalogs with stable error-code mappings, persisted locale state, and explicit `en-US`/`hi-IN` presentation formatting
- **Tests:** Vitest, Testing Library, Node built-in quality/security/CDP/PWA/policy tests, dependency-free real-browser CDP E2E, Rust unit/generated/adversarial parser tests, cargo-fuzz parser target, Android/iOS compile jobs
- **Benchmarks:** Vitest benchmark suites using the existing locked toolchain
- **Quality:** ESLint, Prettier, rustfmt, Clippy, Markdown link audit, exhaustive file-reference audit, secret audit, PWA integrity audit, accessibility contract audit, lock-aware version audit, repository policy audits, GitHub Actions
- **Security:** restrictive/offline Tauri CSP, minimal cross-platform capability scope, static native command allowlist, bounded native export command, same-origin/GET-only PWA cache handling, CodeQL/dependency update configuration, validated persistence/import boundaries, redacted local logging
- **Persistence:** browser/webview local storage; no remote database is required

## Quick start — web companion

Prerequisites: Node.js 22+ and npm.

```bash
git clone https://github.com/sanskarIN/dicelab.git
cd dicelab
npm ci
npm run dev
```

Then open the local URL printed by Vite. Development mode deliberately does **not** register the production service worker.

### Production PWA preview

Build and preview the installable production web target with:

```bash
npm run build
npm run preview
```

Open the preview URL in a compatible browser. After a successful production load, the service worker maintains a same-origin offline application shell and runtime asset cache. Browser install/add-to-home-screen UI varies by platform and browser. See [`docs/web-pwa.md`](docs/web-pwa.md) for the complete cache, install, security, and verification model.

## Desktop development

Install the platform prerequisites described in [`docs/setup.md`](docs/setup.md), including Rust and the Tauri system dependencies, then run:

```bash
npm ci
npm run tauri:dev
```

Build the current-host desktop bundle with:

```bash
npm run tauri:build
```

## Android development

Install the JDK, Android SDK/Build Tools/NDK, configure `ANDROID_HOME` and `NDK_HOME`, and install the Rust Android targets described in [`docs/setup.md`](docs/setup.md). Then:

```bash
npm ci
npm run tauri:android:init
npm run tauri:android:dev
```

Build APK and AAB outputs with:

```bash
npm run tauri:android:build
```

A quicker ARM64-only validation build is available with:

```bash
npm run tauri:android:build -- --target aarch64
```

## iOS / iPadOS development

Tauri iOS commands require macOS with Xcode and the appropriate Rust iOS targets. Then:

```bash
npm ci
npm run tauri:ios:init
npm run tauri:ios:dev
```

Normal signed/distributable development uses:

```bash
npm run tauri:ios:build
```

Repository CI validates an Apple Silicon simulator build without requiring an App Store signing identity:

```bash
npm run tauri:ios:build:ci
```

The locked Tauri CLI also exposes the repository's unsigned ARM64 archive validation command:

```bash
npm run tauri:ios:archive:ci
```

See [`docs/release.md`](docs/release.md) before treating any mobile build as store-ready.

## Quality checks

Dependency-free repository/security/documentation checks can run before application dependencies are installed:

```bash
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
```

After `npm ci`, run the frontend/product suite:

```bash
npm run format
npm run lint
npm run test
npm run build
npm run test:e2e
```

For Rust/native work:

```bash
cd src-tauri
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

The local secret audit reports only file/line/rule metadata and intentionally does not print matched credential values. The repository policy audits protect documented architecture/security/accessibility boundaries; `policy:lockfiles` is an early structural dependency check and does not replace package-manager lock generation. `policy:pwa` syntax-checks the service worker and enforces the committed web install/offline boundary. `policy:accessibility` protects the committed high-value accessibility semantics described in [`docs/accessibility.md`](docs/accessibility.md). `version:check` separately verifies that generated npm/Cargo package versions agree with manifests/configuration. GitHub CodeQL runs separately, and repository-level secret scanning/push protection should be enabled where available.

The real-browser E2E test requires the production build and a Chromium-compatible browser; set `CHROME_BIN` if auto-discovery cannot find one. It covers onboarding, roll/history, actual browser downloads, reload persistence, keyboard command navigation, probability, clear-data, and actual backup file restore. See [`docs/e2e.md`](docs/e2e.md).

PWA install UI and offline reopening require a production build and a compatible secure browser context. The automated audit checks source/config invariants; final ChromeOS/desktop/Android/iOS install behavior still requires real-browser/device evidence. See [`docs/web-pwa.md`](docs/web-pwa.md).

Android/iOS compiler CI does not replace physical-device release evidence. Native document-picker behavior, safe areas, touch interaction, orientation, persistence, and platform signing still require release-candidate validation. See [`docs/setup.md`](docs/setup.md) and [`docs/release.md`](docs/release.md).

See [`docs/testing.md`](docs/testing.md) and [`docs/automation-reference.md`](docs/automation-reference.md) for the complete strategy and automation surface.

### Rust parser fuzzing

From `src-tauri`, developers with the nightly toolchain and `cargo-fuzz` installed can run:

```bash
cargo +nightly fuzz run parser
```

See [`src-tauri/fuzz/README.md`](src-tauri/fuzz/README.md) for the bounded smoke command, corpus policy, and regression workflow.

## Benchmarks

Run the executable benchmark suite with:

```bash
npm run bench
```

Benchmark output is measurement evidence, not a hard CI pass/fail gate. Record the commit, hardware, OS, Node/npm versions, and complete output before comparing release-candidate results. See [`docs/performance.md`](docs/performance.md).

## Production builds

Web/PWA companion:

```bash
npm run build
```

Desktop bundle on the current desktop OS:

```bash
npm run tauri:build
```

Android APK + AAB:

```bash
npm run tauri:android:init
npm run tauri:android:build
```

iOS on macOS/Xcode:

```bash
npm run tauri:ios:init
npm run tauri:ios:build
```

The intended next tag is `v2.18.12`, but it should be created only after candidate checks have been observed on the exact final commit. Version tags run the release workflow, require the tag to match manifest/configuration/generated-lock application versions, directly run documentation inventory and repository policy gates, verify web quality/security/browser checks, build web plus Windows/macOS/Linux desktop artifacts, build universal Android APK/AAB validation artifacts, build an unsigned iOS ARM64 device archive, package successful artifacts into ZIP files, generate `RELEASE-METADATA.json` plus `SHA256SUMS.txt`, and create/update a **draft** GitHub release for manual artifact verification.

Unsigned mobile workflow artifacts are build-validation evidence, not Google Play/App Store publication packages. Android Play distribution requires a private signing keystore/Play Console setup, while iOS end-user distribution requires Apple Developer/App Store Connect signing/provisioning. Platform-specific prerequisites, signing expectations, versioning, physical-device evidence, and release verification are documented in [`docs/release.md`](docs/release.md).

Configured workflows are not the same as observed release evidence. Current blockers are tracked in [`docs/release-blockers-current.md`](docs/release-blockers-current.md), and real candidate results belong in a copy of [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md).

## Architecture

DiceLab is a modular monolith:

```text
src/
├── components/      # product UI and accessible interaction surfaces
├── config/          # stable product metadata and URLs
├── domain/          # parser, engine, RNG, history query, persistence validation, probability, statistics
├── i18n/            # typed catalogs, active locale, formatting, stable error-to-copy mapping
├── services/        # runtime, PWA, persistence, export/backup, logging adapters
├── mobile.css       # safe areas, touch sizing, mobile viewport/orientation ergonomics
└── test/            # shared browser test setup

public/
├── manifest.webmanifest          # install identity/display/icon metadata
├── sw.js                         # production same-origin offline/cache boundary
├── icon-192.png                  # standard PWA install icon
├── icon-512.png                  # large + maskable PWA install icon
├── apple-touch-icon.png          # iOS/iPadOS home-screen icon
└── dicelab-icon.svg              # scalable browser/favicon asset

scripts/
├── cdp-session*                 # dependency-free browser protocol transport + tests
├── e2e-browser.mjs              # production-bundle real-browser journey
├── check-doc-links*             # local Markdown link/anchor audit
├── check-file-reference*        # exhaustive tracked-file documentation audit
├── check-pwa*                   # PWA install/cache/runtime boundary audit + self-tests
├── check-secrets*               # high-confidence credential audit + self-test
├── check-version-sync*          # manifest/config/generated-lock/tag version audit + self-test
├── check-*-policy/boundary*     # executable security/architecture/accessibility invariants
└── verify-release-packages*     # release checksum/provenance verification

src-tauri/
├── capabilities/    # least-privilege Windows/macOS/Linux/Android/iOS window permissions
├── fuzz/            # cargo-fuzz parser harness and workflow documentation
├── icons/           # shipping branding assets
└── src/             # cross-platform native parser, roll command, and bounded export command
```

Tauri-generated Android/Xcode projects are created under `src-tauri/gen/` by `tauri android init` / `tauri ios init`; they are build output/tooling state rather than the source-of-truth application architecture.

The frontend uses web implementations when running as a browser companion and invokes purpose-built Rust commands when running inside Tauri on desktop or mobile. Domain rules remain explicit and testable. Seeded web/native implementations intentionally share an algorithm and fixed compatibility vectors. User-facing validation copy resolves from stable error codes rather than depending on raw exception prose.

Production browser builds may register the PWA service worker only when the runtime is not Tauri and the origin is HTTPS or a recognized localhost/loopback HTTP origin. Tauri desktop/mobile webviews therefore remain outside browser service-worker control.

Native exports never accept an arbitrary destination path/URI from the webview. The native command opens the operating-system-selected `FilePath`; desktop paths, Android document-provider URIs, and iOS selected files remain on the Rust/plugin side of the trust boundary.

Start with [`docs/architecture.md`](docs/architecture.md), [`docs/web-pwa.md`](docs/web-pwa.md), [`docs/application-flows.md`](docs/application-flows.md), [`docs/data-contracts.md`](docs/data-contracts.md), [`docs/code-reference.md`](docs/code-reference.md), and [`docs/adr/`](docs/adr/) for the detailed current design and decision history.

## Dice expression syntax

```text
NdS[selection][modifier]
```

Examples:

```text
1d20
2d6+3
4d6kh3
2d20kl1
6d10dh2-1
```

Selection operators:

- `khN` — keep highest N dice
- `klN` — keep lowest N dice
- `dhN` — drop highest N dice
- `dlN` — drop lowest N dice

Parser/data limits and persistence invariants are documented in [`docs/data-contracts.md`](docs/data-contracts.md).

## Privacy and security

DiceLab is designed to work without cloud storage. Roll history, presets, and settings remain local unless you explicitly export them. Local storage and imported backups are validated rather than trusted blindly. Seeded mode is deterministic and clearly separated from secure random mode. Current diagnostic logging is local-only and redacts sensitive/user-content key families.

The production PWA service worker handles only same-origin GET navigation/static-asset requests, bypasses cross-origin/mutation/range requests, and is never registered in Tauri. It does not add analytics, remote telemetry, cloud persistence, or remote runtime dependencies.

Native exports are initiated explicitly and limited to the user-selected operating-system destination through a bounded Rust command. The filesystem plugin is used as a native implementation detail for selected desktop/mobile files; the webview capability remains `core:default` and does not receive broad filesystem, shell, HTTP, or process permission families.

Repository audits additionally protect capability scope, CSP/offline-network policy, Tauri runtime access, native command names/routing, PWA install/cache boundaries, accessibility semantics/focus invariants, localized formatter use, and lockfile consistency. Read [`PRIVACY.md`](PRIVACY.md), [`SECURITY.md`](SECURITY.md), [`docs/web-pwa.md`](docs/web-pwa.md), [`docs/accessibility.md`](docs/accessibility.md), and the [`docs/repository-policy-gates.md`](docs/repository-policy-gates.md) index before changing a trust boundary. Please report vulnerabilities privately rather than opening a public exploit issue.

## Contributing

Contributions are welcome. Start with [`CONTRIBUTING.md`](CONTRIBUTING.md), follow the [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and keep changes small, tested, accessible, localized through both reviewed catalogs where applicable, cross-platform-aware, and documented. Repository labels, branch-protection rollout, Discussions categories, and release governance are described in [`docs/repository-governance.md`](docs/repository-governance.md).

When a tracked file is added/renamed/deleted, update [`docs/repository-file-reference.md`](docs/repository-file-reference.md) and run `npm run docs:inventory`.

## Documentation

The complete documentation index is [`docs/README.md`](docs/README.md).

Core engineering references:

- [Setup](docs/setup.md)
- [Development](docs/development.md)
- [Architecture](docs/architecture.md)
- [Web / PWA](docs/web-pwa.md)
- [Application flows](docs/application-flows.md)
- [Data and boundary contracts](docs/data-contracts.md)
- [Maintainer code reference](docs/code-reference.md)
- [Automation reference](docs/automation-reference.md)
- [Exhaustive repository file reference](docs/repository-file-reference.md)
- [Testing](docs/testing.md)
- [Real-browser E2E](docs/e2e.md)
- [Accessibility](docs/accessibility.md)
- [Localization](docs/localization.md)
- [Hindi localization review](docs/localization/HINDI_REVIEW.md)
- [Native exports](docs/native-exports.md)
- [Native command contract](docs/native-command-contract.md)
- [Runtime boundary policy](docs/runtime-boundary-policy.md)
- [Native capability policy](docs/capability-policy.md)
- [Tauri security policy](docs/tauri-security-policy.md)
- [Offline network policy](docs/offline-network-policy.md)
- [Repository policy gates](docs/repository-policy-gates.md)
- [Lockfile policy](docs/lockfile-policy.md)
- [Structured logging](docs/logging.md)
- [Performance](docs/performance.md)
- [Repository governance](docs/repository-governance.md)
- [Release](docs/release.md)
- [Current release blockers](docs/release-blockers-current.md)
- [Release candidate evidence template](docs/release-candidate-evidence-template.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Architecture decisions](docs/adr/README.md)
- [Continuation handoffs](docs/handoffs/README.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Current work handoff](what_changed.md)

## Support and contact

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: <https://github.com/sanskarIN>
- Project: <https://github.com/sanskarIN/dicelab>
- Buy Me a Coffee: <https://buymeacoffee.com/sanskarIN>

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)

Funding is optional. DiceLab remains fully usable without donating.

## License

DiceLab is open source under the [MIT License](LICENSE).

---

**Made by the Sanskar**
