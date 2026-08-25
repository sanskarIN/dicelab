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

DiceLab combines expressive dice notation, secure and reproducible randomness modes, offline roll history, expression analytics, reusable/shareable presets, exact probability tools, exports/backups, localization, accessibility, installable PWA support, and native desktop/mobile targets without requiring an account or cloud service.

## Current release status

The repository is preparing **DiceLab 2.0.14** with intended tag `v2.0.14`.

The intermediate 2.0.13 candidate was not published and is superseded by 2.0.14. Package/frontend/Cargo/Tauri source metadata has been bumped to 2.0.14. Generated npm/Cargo lock application metadata is intentionally **not hand-edited** and is currently awaiting the repository lockfile workflow before the version synchronization gate can pass.

The candidate is not publishable until the exact final commit has observed required web/Rust/Android/iOS CI, real-browser/PWA, fuzz, benchmark, physical-device, accessibility/localization, security, screenshot, signing-status, checksum, and provenance evidence.

See [`ROADMAP.md`](ROADMAP.md) and [`docs/release-blockers-current.md`](docs/release-blockers-current.md).

## Product surfaces

| View | What it provides |
| --- | --- |
| Dice Studio | Quick dice, custom expressions, secure/seeded rolling, reusable presets, versioned shareable preset files |
| History | Search/filter, overall statistics, per-expression usage analytics, observed-total histogram, progressive rows, CSV/JSON export |
| Probability | Exact distributions, expected values, P25/P50/P75, standard deviation, threshold probabilities, aggregate A/B comparison, accessible stacked meter, exact per-total A/B overlay with signed deltas |
| Settings | Theme, English/Hindi language, reduced motion, secure/seeded mode, history retention, backup, release/version, About |
| About | Privacy, license, project links, support contacts, funding, version, and credits |

## Highlights

- d4, d6, d8, d10, d12, d20, d100, and custom-sided dice within documented safety limits.
- Multiple dice, signed modifiers, `kh`, `kl`, `dh`, and `dl` keep/drop syntax.
- OS-backed secure randomness in native builds and Web Crypto in browsers.
- Cross-runtime deterministic seeded mode protected by TypeScript/Rust reference vectors.
- Offline-first local history, settings, and custom presets.
- Expression-level history analytics: usage count/share, mean, range, and activity ranking.
- Progressive large-history rendering while analytics/statistics/exports retain the complete active filtered data set.
- Exact ordinary-sum and bounded keep/drop probability distributions.
- Exact quartiles, median/modes, variance/standard deviation, and configurable `P(X=n)`, `P(X≤n)`, `P(X≥n)` analysis.
- Exact independent A/B expression comparison: `P(A>B)`, tie, `P(A<B)`, expected-value delta, accessible stacked visualization, and a per-total dual-bar overlay with signed probability-point deltas.
- Versioned shareable preset JSON format with 1 MB/500-entry bounds, parser normalization, built-in/local-ID exclusion, pre-read oversized-file rejection, and duplicate-safe idempotent imports.
- CSV/JSON history export and validated backup/restore.
- Cross-platform native save/document dialogs through a narrow Rust command; normal browser downloads remain available for the web target.
- Android `content://` document-provider handling through Tauri filesystem abstractions.
- iOS security-scoped selected-file handling with explicit release after writes.
- Spreadsheet-safe handling for formula-like untrusted CSV text cells.
- Stable parser/probability/backup error codes with localized UI mapping.
- Reviewed English/Hindi catalogs, persisted locale, localized built-ins, backup compatibility, document-language metadata, and locale-aware number/date/time formatting.
- Light/dark/system themes, reduced-motion mode, keyboard command palette, focus management, safe areas, dynamic viewport handling, and coarse-pointer touch targets.
- Local-only structured diagnostics with sensitive-key redaction and no remote telemetry requirement.
- Installable production PWA with same-origin service-worker caching and generated Vite runtime precaching.
- Dependency-free real-browser Chromium CDP E2E including expression analytics, exact aggregate probability comparison, real downloads, backup restore, PWA cache checks, and server-offline reopen.
- Rust parser fuzz target and executable benchmarks.
- CI/repository policy gates for CSP/offline networking, Tauri capabilities, runtime/native-command boundaries, localization formatting, PWA integrity, lock consistency, secret scanning, version synchronization, documentation links, and exhaustive tracked-file inventory.
- Cross-platform draft release packaging with provenance and SHA-256 checksums.

## Supported platforms

| Platform | Target | Minimum / notes |
| --- | --- | --- |
| Windows | Tauri 2 desktop | WebView2/Tauri prerequisites apply |
| macOS | Tauri 2 desktop | Platform Tauri/WebKit prerequisites apply |
| Linux | Tauri 2 desktop | WebKitGTK/native prerequisites apply |
| Android | Tauri 2 native + browser PWA | Native API 24+; browser install support varies |
| iOS / iPadOS | Tauri 2 native + home-screen web app | Native iOS/iPadOS 14.0+; Xcode/macOS required to build |
| ChromeOS | Installable PWA | Compatible standards-based browser |
| Modern browsers | React/Vite PWA/web companion | HTTPS or supported local development origin |

Store publication/signing remains separate from source/build support and requires private platform credentials plus physical-device evidence.

## Tech stack

- **Native:** Rust + Tauri 2
- **Frontend:** TypeScript + React + Vite
- **Native plugins:** Tauri dialog + filesystem abstraction behind reviewed native boundaries
- **PWA:** standards-based manifest + guarded production service worker
- **Localization:** typed English/Hindi catalogs and explicit `en-US` / `hi-IN` formatting
- **Tests:** Vitest, Testing Library, dependency-free Node audits/CDP E2E, Rust tests, cargo-fuzz, Android/iOS compile jobs
- **Quality:** ESLint, Prettier, rustfmt, Clippy, policy/version/secret/doc/inventory audits
- **Persistence:** local browser/webview storage; no remote database required

## Quick start — web

Prerequisites: Node.js 22+ and npm.

```bash
git clone https://github.com/sanskarIN/dicelab.git
cd dicelab
npm ci
npm run dev
```

Development mode deliberately does not register the production service worker.

Production/PWA preview:

```bash
npm run build
npm run preview
```

See [`docs/web-pwa.md`](docs/web-pwa.md).

## Desktop development

Install platform prerequisites from [`docs/setup.md`](docs/setup.md), then:

```bash
npm ci
npm run tauri:dev
```

Build the current host:

```bash
npm run tauri:build
```

## Android development

After installing the documented Java/Android/NDK/Rust targets:

```bash
npm ci
npm run tauri:android:init
npm run tauri:android:dev
npm run tauri:android:build
```

ARM64 validation can use:

```bash
npm run tauri:android:build -- --target aarch64
```

## iOS / iPadOS development

Requires macOS/Xcode and the required Rust Apple targets:

```bash
npm ci
npm run tauri:ios:init
npm run tauri:ios:dev
npm run tauri:ios:build
```

CI-oriented validation:

```bash
npm run tauri:ios:build:ci
npm run tauri:ios:archive:ci
```

These validation paths are not automatically App Store-ready signed packages.

## Quality checks

Dependency-free/pre-install checks:

```bash
npm run security:secrets:test
npm run security:secrets
npm run docs:check:test
npm run docs:check
npm run docs:inventory:test
npm run docs:inventory
npm run policy:pwa:test
npm run policy:pwa
npm run policy:test
npm run policy:all
npm run test:e2e:infra
npm run version:check:test
npm run version:check
npm run release:verify:test
```

After `npm ci`:

```bash
npm run format
npm run lint
npm run test
npm run build
npm run test:e2e
npm run bench
```

Rust/native:

```bash
cd src-tauri
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

During the current 2.0.14 source bump, `npm run version:check` is expected to remain blocked until generated lock application metadata is regenerated and committed. Do not manually edit generated locks to make that check appear green.

## Dice syntax

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

- `khN` — keep highest N
- `klN` — keep lowest N
- `dhN` — drop highest N
- `dlN` — drop lowest N

See [`docs/data-contracts.md`](docs/data-contracts.md) for bounds and persisted-data invariants.

## Architecture

```text
src/
├── components/      # accessible product surfaces
├── config/          # product/version/public metadata
├── domain/          # parser, engine, RNG, history analytics, probability, statistics, validation
├── i18n/            # typed catalogs, locale state, formatting, error mapping
├── services/        # runtime/PWA/storage/export/preset sharing/logging adapters
├── probability-overlay.css # exact A/B distribution comparison presentation
├── mobile.css       # mobile/safe-area/touch ergonomics
└── test/            # shared frontend test setup

public/              # manifest, service worker, install icons
scripts/             # audits, version/release checks, dependency-free browser E2E
src-tauri/           # Rust/Tauri config, native commands, mobile targets, fuzzing
```

The renderer never supplies an arbitrary native export destination. Tauri-native API access remains behind reviewed service adapters/Rust commands. Browser service-worker registration is production-only and excluded from Tauri runtimes.

Start with [`docs/architecture.md`](docs/architecture.md), [`docs/code-reference.md`](docs/code-reference.md), and [`docs/data-contracts.md`](docs/data-contracts.md).

## Privacy and security

DiceLab works without cloud storage. Roll history, presets, and settings remain local unless explicitly exported. Imported storage/backup/preset data is validated rather than trusted blindly.

The PWA cache is same-origin, native capabilities remain narrow, native save paths/URIs stay behind the Rust/plugin boundary, and structured logging is local/redacted.

Read [`PRIVACY.md`](PRIVACY.md), [`SECURITY.md`](SECURITY.md), [`docs/native-exports.md`](docs/native-exports.md), and [`docs/repository-policy-gates.md`](docs/repository-policy-gates.md).

## Release preparation

The intended next tag is `v2.0.14`, but it must only be created from a fully verified candidate commit.

Release requirements and current blockers:

- [`docs/release.md`](docs/release.md)
- [`docs/release-blockers-current.md`](docs/release-blockers-current.md)
- [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`CHANGELOG.md`](CHANGELOG.md)
- [`what_changed.md`](what_changed.md)

Configured workflows and committed tests are implementation, not proof that a final candidate passed.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Keep changes focused, tested, cross-platform-aware, accessible, localized where applicable, and documented.

When adding/renaming/deleting a tracked file, update [`docs/repository-file-reference.md`](docs/repository-file-reference.md).

## Documentation

Documentation hub: [`docs/README.md`](docs/README.md)

Key references:

- [Setup](docs/setup.md)
- [Development](docs/development.md)
- [Architecture](docs/architecture.md)
- [Application flows](docs/application-flows.md)
- [Data contracts](docs/data-contracts.md)
- [Code reference](docs/code-reference.md)
- [Testing](docs/testing.md)
- [Real-browser E2E](docs/e2e.md)
- [Web/PWA](docs/web-pwa.md)
- [Localization](docs/localization.md)
- [Accessibility](docs/accessibility.md)
- [Native exports](docs/native-exports.md)
- [Repository policy gates](docs/repository-policy-gates.md)
- [Release guide](docs/release.md)
- [Current release blockers](docs/release-blockers-current.md)
- [Exhaustive repository file reference](docs/repository-file-reference.md)

## Support and contact

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: <https://github.com/sanskarIN>
- Project: <https://github.com/sanskarIN/dicelab>
- Buy Me a Coffee: <https://buymeacoffee.com/sanskarIN>

Funding is optional. DiceLab remains fully usable without donating.

## License

DiceLab is open source under the [MIT License](LICENSE).

---

**Made by the Sanskar**