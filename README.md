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

DiceLab goes beyond a one-button dice demo. It combines expressive dice notation, secure and cross-runtime reproducible randomness modes, roll history, statistics, presets, exports, and exact probability tools in a desktop-first product that remains useful without an account or network connection.

## Screenshots

Real release screenshots will be captured from a verified release-candidate build. Until then, the repository intentionally avoids mock screenshots that could misrepresent the shipping UI.

| View | What it provides |
| --- | --- |
| Dice Studio | Quick d4/d6/d8/d10/d12/d20/d100 choices, custom expressions, presets, and result details |
| History | Searchable local roll log, statistics, histogram, progressive large-list rendering, CSV/JSON export |
| Probability | Exact common-expression distributions and expected values with explicit complexity/precision limits |
| Settings | Theme, reduced motion, secure/seeded mode, history retention, backup, release/version, and About access |
| About | Privacy, license, project links, support contacts, funding, version, and credits |

## Features

- d4, d6, d8, d10, d12, d20, d100, and custom-sided dice up to documented safety limits.
- Multiple dice, signed modifiers, and `kh`, `kl`, `dh`, and `dl` keep/drop expressions.
- Native secure random mode backed by the operating system through Rust, with Web Crypto in the web companion.
- Deterministic seeded mode with matching TypeScript/Rust reference vectors for cross-runtime reproducibility.
- Offline-first local history, saved tabletop presets, statistics, and observed histograms.
- Progressive rendering for large retained histories while statistics and exports still use the full filtered data set.
- Exact probability distributions for normal sums and manageable keep/drop pools, with safe-integer exactness guards.
- CSV and JSON roll-log export plus validated JSON backup/restore.
- Spreadsheet-safe CSV handling for formula-like user-controlled cells.
- Light, dark, and system themes.
- Reduced-motion and non-animation modes with normalized persisted settings.
- Keyboard command palette (`Ctrl/Cmd + K`) with modal focus trapping/restoration and keyboard-first navigation.
- Responsive desktop/web UI with accessible labels, focus styles, scalable layouts, and non-color-only states.
- Typed English message catalog and locale boundary for future localization.
- No required sign-in, analytics service, advertising SDK, or donation gate.

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
- **Localization:** typed in-repository English catalog with an extensible locale boundary
- **Tests:** Vitest, Testing Library, Rust unit tests, generated parser invariants, integration journeys
- **Quality:** ESLint, Prettier, rustfmt, Clippy, Markdown link audit, GitHub Actions
- **Security:** restrictive Tauri CSP, minimal capabilities, CodeQL/dependency update configuration, validated persistence/import boundaries
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

```bash
npm run docs:check
npm run format
npm run lint
npm run test
npm run build

cd src-tauri
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

See [`docs/testing.md`](docs/testing.md) for the complete strategy and CI expectations.

## Production builds

Web companion:

```bash
npm run build
```

Desktop bundle:

```bash
npm run tauri:build
```

Version tags run the release workflow, build web plus Windows/macOS/Linux desktop artifacts, package successful artifacts into ZIP files, generate `SHA256SUMS.txt`, and create/update a **draft** GitHub release for manual artifact verification. Platform-specific prerequisites, signing expectations, versioning, and release verification are documented in [`docs/release.md`](docs/release.md).

## Architecture

DiceLab is a modular monolith:

```text
src/
├── components/      # product UI and accessible interaction surfaces
├── config/          # stable product metadata and URLs
├── domain/          # parser, engine, RNG, persistence validation, probability, statistics
├── i18n/            # typed locale catalogs and locale boundary
├── services/        # persistence, export/backup, native/web adapters
└── test/            # shared browser test setup

src-tauri/
├── capabilities/    # least-privilege desktop permissions
├── icons/           # shipping branding assets
└── src/             # native parser and secure/seeded roll command
```

The frontend uses a web implementation when running as a browser companion and invokes the Rust command when running inside Tauri. Domain rules remain explicit and testable. Seeded web/native implementations intentionally share an algorithm and fixed compatibility vectors. See [`docs/architecture.md`](docs/architecture.md) and [`docs/adr/`](docs/adr/) for decisions and trade-offs.

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

## Privacy and security

DiceLab is designed to work without cloud storage. Roll history, presets, and settings remain local unless you explicitly export them. Local storage and imported backups are validated rather than trusted blindly. Seeded mode is deterministic and clearly separated from secure random mode.

Read [`PRIVACY.md`](PRIVACY.md) and [`SECURITY.md`](SECURITY.md) before reporting privacy or security concerns. Please report vulnerabilities privately rather than opening a public exploit issue.

## Contributing

Contributions are welcome. Start with [`CONTRIBUTING.md`](CONTRIBUTING.md), follow the [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and keep changes small, tested, accessible, localized through the message catalog where applicable, and documented.

## Documentation

- [Setup](docs/setup.md)
- [Development](docs/development.md)
- [Architecture](docs/architecture.md)
- [Testing](docs/testing.md)
- [Accessibility](docs/accessibility.md)
- [Localization](docs/localization.md)
- [Performance](docs/performance.md)
- [Release](docs/release.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Work handoff](what_changed.md)

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
