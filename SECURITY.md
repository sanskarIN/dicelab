# Security Policy

## Supported versions

DiceLab is currently preparing the **2.0.12** cross-platform release candidate. Security fixes are applied to the latest `main` branch and the most recent published release. Older development snapshots may not receive backports.

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

## Supported native/security surface

The 2.0.12 source/configuration targets:

- Windows through Tauri 2;
- macOS through Tauri 2;
- Linux through Tauri 2;
- Android API 24+ through Tauri 2 mobile;
- iOS/iPadOS 14.0+ through Tauri 2 mobile;
- modern browsers through the Vite web companion.

Adding a native target does not justify widening the renderer trust boundary. The same least-privilege principles apply across desktop and mobile.

## Security design notes

- Native secure rolls use Rust's operating-system-backed `OsRng` path on Tauri desktop/mobile targets.
- Browser secure rolls use Web Crypto and rejection sampling for bounded integers.
- Seeded mode is intentionally deterministic, cross-runtime reproducible, and visibly separated from secure mode; it is not a cryptographic primitive.
- Native builds use a restrictive Content Security Policy.
- Tauri capabilities are kept minimal and do not grant broad filesystem, shell, HTTP, or process access to the renderer.
- The current `main` capability is explicitly scoped to Linux, macOS, Windows, Android, and iOS and retains only `core:default`.
- DiceLab does not require an account or remote database for normal operation.
- Persisted roll/preset records are validated before they are restored into application state; malformed records are discarded from ordinary local storage and rejected in imported backups.
- Backup imports enforce schema size limits, expression consistency, bounded values, canonical timestamps, unique identifiers, deterministic-seed requirements, and coherent keep/drop totals before state replacement.
- Parser, probability, and backup failures expose stable internal error codes to presentation code instead of requiring UI components to trust raw exception prose.
- CSV export neutralizes formula-like untrusted text cells before normal CSV quoting while preserving generated numeric fields as numeric output.
- Exported files are created only after an explicit user action.
- Native CSV/JSON/backup exports use a dedicated Rust save command: the webview supplies no destination path or URI, the operating-system dialog/picker chooses a `FilePath`, and the command validates format, suggested filename, payload size, and normal selected-path extensions before writing.
- Android document-provider `content://` selections are handled through Tauri's native filesystem abstraction rather than being converted to ordinary paths.
- iOS selected files may use security-scoped access; DiceLab explicitly releases that access after the native write.
- Native export failures returned to the interface do not include private selected filesystem paths, file URLs, content URIs, or raw provider errors.
- Structured application logging redacts sensitive key families, bounds nested context, and never serializes raw error messages/stacks.
- Tagged builds package artifacts only after prerequisite quality jobs succeed and generate SHA-256 checksum metadata for draft-release review.
- Android/iOS CI outputs are treated as validation artifacts unless a separate reviewed signing/distribution path is completed.
- The repository must not contain credentials, signing keys, access tokens, Android keystores, Apple private certificates, provisioning secrets, store API credentials, or private production data.

## Native export trust boundary

Browser builds use the browser's ordinary download mechanism and request no native filesystem capability.

Windows, macOS, Linux, Android, and iOS/iPadOS builds expose only the purpose-built `save_text_export` Tauri command for current text exports. The frontend may request a bounded CSV or JSON payload and a safe suggested filename, but it cannot pass an arbitrary output path or content URI.

The native command opens the system save/document dialog and writes only to the user-selected `FilePath` through the Rust-side filesystem plugin.

For normal filesystem paths, the selected extension is rechecked before writing. Android `content://` selections remain URI-backed native selections and are not passed through `std::fs` path APIs. iOS security-scoped access is released after the write completes.

This design intentionally avoids granting the webview broad filesystem-write access. Adding another native export format requires extending the native allowlist and regression coverage rather than exposing a general write primitive. See [`docs/native-exports.md`](docs/native-exports.md).

## Mobile UI/security boundary

Mobile support includes safe-area and touch-target styling but does not introduce remote content or a separate unreviewed UI runtime.

Release review should verify:

- notches, system bars, and home indicators do not cover security- or data-related controls;
- OS file-picker cancellation does not create a false success/failure state;
- returning from document/file providers does not bypass local validation;
- orientation changes do not expose hidden destructive actions or inaccessible confirmation controls;
- mobile logs do not expose private selected file/provider identifiers.

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

Release artifacts remain drafts until a maintainer reviews checksums and platform smoke tests. Signing/notarization/store credentials, when configured, must remain in protected CI secrets or platform credential stores rather than source control.

## Signing and store-distribution boundary

A successful unsigned mobile build is not proof of store readiness.

- Android publication requires reviewed signing/keystore handling and Google Play configuration.
- iOS/App Store publication requires Apple Developer/App Store Connect signing/provisioning.
- macOS distribution may require signing/notarization depending on the release path.
- Windows distribution may require signing depending on the release path.

Release notes and artifact labels must state actual signing status accurately. Never commit private signing material to make CI easier.

## Scope

Examples of in-scope issues include:

- arbitrary code execution through application inputs;
- unintended filesystem/network capabilities;
- native file-picker/provider trust-boundary errors;
- injection or unsafe rendering of untrusted content;
- sensitive local data exposure;
- malicious or malformed backup/persistence behavior;
- spreadsheet formula execution caused by exported user-controlled data;
- insecure logging or accidental disclosure of user-controlled/private data;
- mobile lifecycle/orientation behavior that bypasses intended validation or confirmation;
- insecure update/release/signing behavior;
- dependency vulnerabilities with a practical DiceLab impact.

Purely theoretical findings without a realistic product impact may be documented without an urgent release.

Thank you for helping keep DiceLab users safe.
