# DiceLab

<p align="center">
  <img src="src-tauri/icons/icon.png" alt="DiceLab logo" width="128" height="128" />
</p>

<p align="center"><strong>A polished, offline-first dice simulator for tabletop play, testing, teaching, and probability exploration.</strong></p>

<p align="center">
  <a href="https://github.com/sanskarIN/dicelab/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/sanskarIN/dicelab/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://buymeacoffee.com/sanskarIN"><img alt="Buy Me a Coffee" src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000" /></a>
</p>

## Why DiceLab?

DiceLab goes beyond a one-button dice demo. It combines expressive dice notation, secure and cross-runtime reproducible randomness modes, roll history, statistics, presets, exports, exact probability tools, hardened local persistence, localization, and release-focused engineering in a desktop-first product that remains useful without an account or network connection.

## Current release status

The repository is preparing **DiceLab 2.0.12** with intended tag `v2.0.12`. The application manifests/configuration have been advanced to 2.0.12, but the candidate is **not yet publishable** until generated npm/Cargo lockfiles and the required CI, browser, fuzz, platform, accessibility, security, screenshot, checksum, and provenance evidence are observed for the same candidate commit.

`npm run version:check` deliberately includes generated lockfile package-version metadata, so a version bump cannot pass release verification while `package-lock.json` or DiceLab's `Cargo.lock` package entry still carries an older version. Current blockers are maintained in [`docs/release-blockers-current.md`](docs/release-blockers-current.md).

## Screenshots

Real release screenshots will be captured from a verified release-candidate build. Until then, the repository intentionally avoids mock screenshots that could misrepresent the shipping UI.

| View | What it provides |
| --- | --- |
| Dice Studio | Quick d4/d6/d8/d10/d12/d20/d100 choices, custom expressions, presets, and result details |
| History | Searchable local roll log, statistics, histogram, progressive large-list rendering, CSV/JSON export |
| Probability | Exact common-expression distributions and expected values with explicit complexity/precision limits |
| Settings | Theme, English/Hindi language, reduced motion, secure/seeded mode, history retention, backup, release/version, and About access |
| About | Privacy, license, project links, support contacts, funding, version, and credits |

## Features

- d4, d6, d8, d10, d12, d20, d100, and custom-sided dice up to documented safety limits.
- Multiple dice, signed modifiers, and `kh`, `kl`, `dh`, and `dl` keep/drop expressions.
- Native secure random mode backed by the operating system through Rust, with Web Crypto in the web companion.
- Deterministic seeded mode with matching TypeScript/Rust reference vectors for cross-runtime reproducibility.
- Offline-first local history, saved tabletop presets, statistics, and observed histograms.
- Progressive rendering for large retained histories while statistics and exports still use the full filtered data set.
- Reusable domain history filtering for expression/total queries.
- Exact probability distributions for normal sums and manageable keep/drop pools, with safe-integer exactness guards.
- CSV and JSON roll-log export plus validated JSON backup/restore.
- Native desktop save dialogs for CSV/JSON exports through a dedicated bounded Rust command, with ordinary browser downloads retained for the web companion.
- Spreadsheet-safe CSV handling for formula-like user-controlled cells.
- Stable parser/probability/backup error codes mapped to localized user-facing messages.
- Reviewed English and Hindi interface catalogs with a persisted language preference, localized built-in presets, backup compatibility, document-language metadata, and explicit locale-aware number/date/time formatting.
- Light, dark, and system themes.
- Reduced-motion and non-animation modes with normalized persisted settings.
- Keyboard command palette (`Ctrl/⌘ K`) with modal focus trapping/restoration and keyboard-first navigation.
- Responsive desktop/web UI with accessible labels, focus styles, scalable layouts, and non-color-only states.
- Structured local diagnostic logging with sensitive-key redaction, bounded context, and raw-error omission.
- Coverage-guided Rust parser fuzz target with a bounded scheduled/manual GitHub Actions campaign.
- Dependency-free high-confidence secret audit in normal CI and tagged release verification.
- Dependency-free Node 22 + Chromium CDP real-browser E2E smoke for the production bundle.
- Executable benchmark suites for parser, RNG, probability, history filtering, and statistics.
- Automated architecture/security policy gates for Tauri capabilities, CSP/offline network sources, localized formatting, runtime boundaries, native command contracts, and direct dependency-lock consistency.
- Exhaustive tracked-file documentation inventory checked against `git ls-files` so new repository files cannot be silently omitted from the file reference.
- Automated version synchronization checks across npm/frontend/Cargo/Tauri metadata **and generated npm/Cargo lock package versions**, plus tag/version agreement on releases.
- Tag-driven releases directly gate artifact creation on documentation inventory, repository policy, lock/version consistency, tests, real-browser E2E, and locked Rust checks.
- Release provenance metadata and SHA-256 checksums for draft artifact review.
- No required sign-in, analytics service, advertising SDK, remote telemetry, or donation gate.

## Supported platforms

| Platform | Target |
| --- | --- |
| Windows | Tauri desktop application |
| macOS | Tauri desktop application |
| Linux | Tauri desktop application |
| Modern browsers | Vite web companion |

## Tech stack

- **Native core:** Rust + Tauri 2
- **Frontend:** TypeScript + React + Vite
- **Localization:** typed in-repository English/Hindi catalogs with stable error-code mappings, persisted locale state, and explicit `en-US`/`hi-IN` presentation formatting
- **Tests:** Vitest, Testing Library, Node built-in quality/security/CDP/policy tests, dependency-free real-browser CDP E2E, Rust unit/generated/adversarial parser tests, cargo-fuzz parser target
- **Benchmarks:** Vitest benchmark suites using the existing locked toolchain
- **Quality:** ESLint, Prettier, rustfmt, Clippy, Markdown link audit, exhaustive file-reference audit, secret audit, lock-aware version audit, repository policy audits, GitHub Actions
- **Security:** restrictive/offline Tauri CSP, minimal capabilities, static native command allowlist, bounded native export command, CodeQL/dependency update configuration, validated persistence/import boundaries, redacted local logging
- **Persistence:** browser/webview local storage; no remote database is required

## Quick start — web companion

Prerequisites: Node.js 22+ and npm.

```bash
git clone https://github.com/sanskarIN/dicelab.git
cd dicelab
npm ci
npm run dev
```

Then open the local URL printed by Vite.

## Desktop development

Install the platform prerequisites described in [`docs/setup.md`](docs/setup.md), including Rust and the Tauri system dependencies, then run:

```bash
npm ci
npm run tauri:dev
```

## Quality checks

Dependency-free repository/security/documentation checks can run before application dependencies are installed:

```bash
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

The local secret audit reports only file/line/rule metadata and intentionally does not print matched credential values. The repository policy audits protect documented architecture/security boundaries; `policy:lockfiles` is an early structural dependency check and does not replace package-manager lock generation. `version:check` separately verifies that generated npm/Cargo package versions agree with the manifests/configuration. GitHub CodeQL runs separately, and repository-level secret scanning/push protection should be enabled where available.

The real-browser E2E test requires the production build and a Chromium-compatible browser; set `CHROME_BIN` if auto-discovery cannot find one. It covers onboarding, roll/history, actual browser downloads, reload persistence, keyboard command navigation, probability, clear-data, and actual backup file restore. See [`docs/e2e.md`](docs/e2e.md).

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

Web companion:

```bash
npm run build
```

Desktop bundle:

```bash
npm run tauri:build
```

The intended next tag is `v2.0.12`, but it should be created only after the generated lockfiles are current and candidate checks have been observed. Version tags run the release workflow, require the tag to match manifest/configuration/generated-lock application versions, directly run documentation inventory and repository policy gates, verify web quality/security/browser checks, build web plus Windows/macOS/Linux desktop artifacts, package successful artifacts into ZIP files, generate `RELEASE-METADATA.json` plus `SHA256SUMS.txt`, and create/update a **draft** GitHub release for manual artifact verification. Platform-specific prerequisites, signing expectations, versioning, and release verification are documented in [`docs/release.md`](docs/release.md).

Configured workflows are not the same as observed release evidence. Current blockers are tracked in [`docs/release-blockers-current.md`](docs/release-blockers-current.md), and real candidate results belong in a copy of [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md).

## Architecture

DiceLab is a modular monolith:

```text
src/
├── components/      # product UI and accessible interaction surfaces
├── config/          # stable product metadata and URLs
├── domain/          # parser, engine, RNG, history query, persistence validation, probability, statistics
├── i18n/            # typed catalogs, active locale, formatting, stable error-to-copy mapping
├── services/        # runtime adapters, persistence, export/backup, logging
└── test/            # shared browser test setup

scripts/
├── cdp-session*                 # dependency-free browser protocol transport + tests
├── e2e-browser.mjs              # production-bundle real-browser journey
├── check-doc-links*             # local Markdown link/anchor audit
├── check-file-reference*        # exhaustive tracked-file documentation audit
├── check-secrets*               # high-confidence credential audit + self-test
├── check-version-sync*          # manifest/config/generated-lock/tag version audit + self-test
├── check-*-policy/boundary*     # executable security/architecture invariants
└── verify-release-packages*     # release checksum/provenance verification

src-tauri/
├── capabilities/    # least-privilege desktop permissions
├── fuzz/            # cargo-fuzz parser harness and workflow documentation
├── icons/           # shipping branding assets
└── src/             # native parser, roll command, and bounded native export command
```

The frontend uses web implementations when running as a browser companion and invokes purpose-built Rust commands when running inside Tauri. Domain rules remain explicit and testable. Seeded web/native implementations intentionally share an algorithm and fixed compatibility vectors. User-facing validation copy resolves from stable error codes rather than depending on raw exception prose. Desktop exports never accept an arbitrary destination path from the webview; the native command receives the user-selected path from the system dialog.

Start with [`docs/architecture.md`](docs/architecture.md), [`docs/application-flows.md`](docs/application-flows.md), [`docs/data-contracts.md`](docs/data-contracts.md), [`docs/code-reference.md`](docs/code-reference.md), and [`docs/adr/`](docs/adr/) for the detailed current design and decision history.

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

DiceLab is designed to work without cloud storage. Roll history, presets, and settings remain local unless you explicitly export them. Local storage and imported backups are validated rather than trusted blindly. Seeded mode is deterministic and clearly separated from secure random mode. Current diagnostic logging is local-only and redacts sensitive/user-content key families. Native desktop exports are initiated explicitly and limited to the user-selected system-dialog destination through a bounded Rust command.

Repository audits additionally protect capability scope, CSP/offline-network policy, Tauri runtime access, native command names/routing, localized formatter use, and lockfile consistency. Read [`PRIVACY.md`](PRIVACY.md), [`SECURITY.md`](SECURITY.md), and the [`docs/repository-policy-gates.md`](docs/repository-policy-gates.md) index before changing a trust boundary. Please report vulnerabilities privately rather than opening a public exploit issue.

## Contributing

Contributions are welcome. Start with [`CONTRIBUTING.md`](CONTRIBUTING.md), follow the [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and keep changes small, tested, accessible, localized through both reviewed catalogs where applicable, and documented. Repository labels, branch-protection rollout, Discussions categories, and release governance are described in [`docs/repository-governance.md`](docs/repository-governance.md).

When a tracked file is added/renamed/deleted, update [`docs/repository-file-reference.md`](docs/repository-file-reference.md) and run `npm run docs:inventory`.

## Documentation

The complete documentation index is [`docs/README.md`](docs/README.md).

Core engineering references:

- [Setup](docs/setup.md)
- [Development](docs/development.md)
- [Architecture](docs/architecture.md)
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
- [Desktop capability policy](docs/capability-policy.md)
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
