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

- Native secure rolls use Rust's operating-system-backed `OsRng` path.
- Browser secure rolls use Web Crypto and rejection sampling for bounded integers.
- Seeded mode is intentionally deterministic, cross-runtime reproducible, and visibly separated from secure mode; it is not a cryptographic primitive.
- The desktop application uses a restrictive Content Security Policy.
- Tauri capabilities are kept minimal and do not grant broad filesystem or shell access.
- DiceLab does not require an account or remote database for normal operation.
- Persisted roll/preset records are validated before they are restored into application state; malformed records are discarded from ordinary local storage and rejected in imported backups.
- Backup imports enforce schema size limits, expression consistency, bounded values, canonical timestamps, unique identifiers, deterministic-seed requirements, and coherent keep/drop totals before state replacement.
- CSV export neutralizes cells beginning with common spreadsheet formula prefixes (`=`, `+`, `-`, `@`) before normal CSV quoting.
- Exported files are created only after an explicit user action.
- Tagged builds package artifacts only after prerequisite quality jobs succeed and generate SHA-256 checksum metadata for draft-release review.
- The repository must not contain credentials, signing keys, access tokens, or private production data.

## Local data trust boundary

Browser/webview local storage is treated as potentially corrupted or user-modifiable input. DiceLab therefore does not assume that values read from storage still match TypeScript interfaces.

On load:

- settings are normalized to supported enums and numeric bounds;
- reduced-motion state wins over contradictory animation state;
- history and custom presets are structurally/domain validated;
- duplicate IDs are removed from ordinary local persistence;
- forged entries using reserved built-in preset IDs are ignored.

Backup import is stricter than recovery from ordinary local storage: ambiguous/duplicate records cause the import to fail rather than silently changing the supplied backup.

## Dependency and supply-chain security

The repository uses committed npm/Cargo lockfiles, automated dependency update configuration, locked CI installation, CodeQL/static analysis, and minimal dependency policy. Contributors should avoid adding dependencies for trivial functionality and should prefer maintained packages with clear licensing and security posture.

Release artifacts remain drafts until a maintainer reviews checksums and platform smoke tests. Signing/notarization credentials, if configured later, must remain in protected CI secrets rather than source control.

## Scope

Examples of in-scope issues include:

- arbitrary code execution through application inputs;
- unintended filesystem/network capabilities;
- injection or unsafe rendering of untrusted content;
- sensitive local data exposure;
- malicious or malformed backup/persistence behavior;
- spreadsheet formula execution caused by exported user-controlled data;
- insecure update/release behavior;
- dependency vulnerabilities with a practical DiceLab impact.

Purely theoretical findings without a realistic product impact may be documented without an urgent release.

Thank you for helping keep DiceLab users safe.
