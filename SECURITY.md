# Security Policy

## Supported versions

DiceLab is currently pre-1.0. Security fixes are applied to the latest `main` branch and the most recent published release. Older development snapshots may not receive backports.

## Reporting a vulnerability

Please do **not** open a public issue for a suspected vulnerability that could expose users or provide a ready-to-use exploit.

Send a private report to:

- `supportramsandesh@gmail.com`
- or `sanskarin@outlook.in`

Include:

- affected version or commit;
- platform and environment;
- concise reproduction steps;
- expected versus actual behavior;
- potential impact;
- any suggested mitigation, if known.

Do not include real secrets, private third-party data, or unnecessary personal information in a report.

## Response process

Maintainers will review reports, reproduce the issue where possible, assess severity, prepare a fix and regression test, and coordinate disclosure after users have a reasonable opportunity to update. Response timing depends on severity and maintainer availability; no fixed remediation deadline is guaranteed.

## Security design notes

- Native random rolls use Rust's operating-system-backed secure randomness path.
- Seeded mode is intentionally deterministic and is visibly separated from secure mode.
- The desktop application uses a restrictive Content Security Policy.
- Tauri capabilities are kept minimal and do not grant broad filesystem or shell access.
- DiceLab does not require an account or remote database for normal operation.
- Exported files are created only after an explicit user action.
- The repository must not contain credentials, signing keys, access tokens, or private production data.

## Dependency and supply-chain security

The repository uses automated dependency update configuration, CI checks, and static analysis. Contributors should avoid adding dependencies for trivial functionality and should prefer maintained packages with clear licensing and security posture.

## Scope

Examples of in-scope issues include:

- arbitrary code execution through application inputs;
- unintended filesystem/network capabilities;
- injection or unsafe rendering of untrusted content;
- sensitive local data exposure;
- insecure update/release behavior;
- dependency vulnerabilities with a practical DiceLab impact.

Purely theoretical findings without a realistic product impact may be documented without an urgent release.

Thank you for helping keep DiceLab users safe.
