# Contributing to DiceLab

Thank you for helping improve DiceLab. Contributions should keep the project reliable, accessible, private by default, and easy to review.

## Before you start

1. Search existing issues and pull requests for related work.
2. For a large behavior or architecture change, open an issue before implementation.
3. Keep one pull request focused on one coherent change.
4. Never include credentials, private user data, signing secrets, or production-only endpoints.

## Local setup

See [`docs/setup.md`](docs/setup.md) for platform prerequisites.

```bash
git clone https://github.com/sanskarIN/dicelab.git
cd dicelab
npm install
npm run dev
```

For the desktop application:

```bash
npm run tauri:dev
```

## Branch and commit style

Use a short descriptive branch name such as `feat/history-filter` or `fix/seed-validation`.

Conventional Commits are preferred:

- `feat: add ...`
- `fix: handle ...`
- `test: cover ...`
- `docs: document ...`
- `refactor: simplify ...`
- `perf: optimize ...`
- `security: harden ...`
- `build: configure ...`
- `ci: verify ...`
- `chore: maintain ...`

Commits should be small and meaningful. Do not create artificial churn merely to increase commit count.

## Quality checklist

Before opening a pull request, run the relevant checks:

```bash
npm run format
npm run lint
npm run test
npm run build

cd src-tauri
cargo fmt --all -- --check
cargo test
cargo clippy --all-targets --all-features -- -D warnings
```

Add regression tests for bugs. Add unit tests for business rules. Update docs when behavior or setup changes.

## Accessibility

For UI changes:

- preserve keyboard navigation and visible focus;
- use semantic controls and labels;
- do not communicate status by color alone;
- test reduced-motion behavior;
- keep touch targets comfortable;
- verify light and dark themes;
- preserve readable contrast and scalable text.

See [`docs/accessibility.md`](docs/accessibility.md).

## Security and privacy

Validate untrusted inputs at boundaries. Avoid remote dependencies in the product runtime unless there is a documented need. Never weaken Tauri capabilities or CSP without explaining the reason and security impact.

Report vulnerabilities according to [`SECURITY.md`](SECURITY.md), not in a public issue.

## Pull requests

A good pull request includes:

- a clear problem statement;
- a concise implementation description;
- verification commands and results;
- screenshots for visible UI changes when practical;
- accessibility/security notes when relevant;
- tests for changed behavior;
- documentation changes where required.

By contributing, you agree that your contribution is licensed under the repository's MIT License.

## Contact

Questions about contributions can be sent to `sanskarin@outlook.in`. Support questions belong at `supportramsandesh@gmail.com`.

**Made by the Sanskar**
