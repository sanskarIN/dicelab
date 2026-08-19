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
- Parser, probability, and backup failures expose stable internal error codes to presentation code instead of requiring UI components to trust raw exception prose.
- CSV export neutralizes cells beginning with common spreadsheet formula prefixes (`=`, `+`, `-`, `@`) before normal CSV quoting.
- Exported files are created only after an explicit user action.
- Desktop CSV/JSON exports use a dedicated Rust save command: the webview supplies no destination path, the operating-system dialog chooses the path, and the command validates format, filename, payload size, and the final selected extension before writing.
- Native export failures returned to the interface do not include private selected filesystem paths.
- Structured application logging redacts sensitive key families, bounds nested context, and never serializes raw error messages/stacks.
- Tagged builds package artifacts only after prerequisite quality jobs succeed and generate SHA-256 checksum metadata for draft-release review.
- The repository must not contain credentials, signing keys, access tokens, or private production data.

## Native export trust boundary

Browser builds use the browser's ordinary download mechanism and request no native filesystem capability.

Desktop builds expose only the purpose-built `save_text_export` Tauri command for current text exports. The frontend may request a bounded CSV or JSON payload and a safe suggested filename, but it cannot pass an arbitrary output path. The native command opens the system save dialog and writes only to the user-selected path after rechecking the selected extension.

This design intentionally avoids granting the webview broad filesystem-write access. Adding another native export format requires extending the native allowlist and regression coverage rather than exposing a general write primitive. See [`docs/native-exports.md`](docs/native-exports.md).

## Local data trust boundary

Browser/webview local storage is treated as potentially corrupted or user-modifiable input. DiceLab therefore does not assume that values read from storage still match TypeScript interfaces.

On load:

- settings are normalized to supported enums and numeric bounds;
- reduced-motion state wins over contradictory animation state;
- history and custom presets are structurally/domain validated;
- duplicate IDs are removed from ordinary local persistence;
- forged entries using reserved built-in preset IDs are ignored.

Backup import is stricter than recovery from ordinary local storage: ambiguous/duplicate records cause the import to fail rather than silently changing the supplied backup.

## Logging and diagnostics

DiceLab does not require remote telemetry. Current diagnostic logs are local console events for operational failures such as storage degradation or the application recovery boundary.

The logging boundary in `src/services/logger.ts` is designed so callers pass stable event names and bounded metadata. Sensitive key names—including credentials, seeds, email/name fields, expressions, history, presets, backups, files, payloads, messages, and stacks—are redacted. Raw `Error.message` and `Error.stack` are not serialized.

Normal dice rolls and user-correctable validation failures are not logged by default. See [`docs/logging.md`](docs/logging.md) before adding new log events.

## Dependency, secret, and supply-chain security

The repository uses committed npm/Cargo lockfiles, automated dependency update configuration, locked CI installation, CodeQL/static analysis, and minimal dependency policy. Contributors should avoid adding dependencies for trivial functionality and should prefer maintained packages with clear licensing and security posture.

CI and tagged release verification also run `npm run security:secrets`, a dependency-free high-confidence scan for committed private-key headers and common credential-token formats. The scanner reports only file, line, and rule identifier; it intentionally does not print the matched credential value. Its own detection/redaction behavior is verified with `npm run security:secrets:test`.

This local audit is defense in depth. Where GitHub repository security settings are available, enable secret scanning, push protection, Dependabot alerts/security updates, dependency graph, CodeQL/code scanning, and private vulnerability reporting as described in [`docs/repository-governance.md`](docs/repository-governance.md).

If a real credential is ever committed, removing the text from a later commit is not sufficient: revoke/rotate the credential and assess exposure.

Release artifacts remain drafts until a maintainer reviews checksums and platform smoke tests. Signing/notarization credentials, if configured later, must remain in protected CI secrets rather than source control.

## Scope

Examples of in-scope issues include:

- arbitrary code execution through application inputs;
- unintended filesystem/network capabilities;
- injection or unsafe rendering of untrusted content;
- sensitive local data exposure;
- malicious or malformed backup/persistence behavior;
- spreadsheet formula execution caused by exported user-controlled data;
- insecure logging or accidental disclosure of user-controlled/private data;
- insecure update/release behavior;
- dependency vulnerabilities with a practical DiceLab impact.

Purely theoretical findings without a realistic product impact may be documented without an urgent release.

Thank you for helping keep DiceLab users safe.
