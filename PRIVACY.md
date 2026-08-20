# DiceLab Privacy Notice

_Last updated: 2026-08-20_

DiceLab is designed as an offline-first utility across Windows, macOS, Linux, Android, iOS/iPadOS, and modern browsers. Normal dice rolling does not require an account, analytics service, advertising SDK, or remote application database.

## Data stored locally

Depending on the platform, DiceLab stores the following in browser/webview local storage:

- recent roll history;
- saved custom presets;
- appearance and accessibility preferences;
- selected English/Hindi language preference;
- random-mode preference and user-provided deterministic seed;
- first-run onboarding completion state.

This data remains on the device unless the user explicitly exports it or another program/user with access to the device reads the application storage.

## Exports and backups

DiceLab can export roll logs as CSV or JSON and can create a JSON backup containing local history, custom presets, and settings. Exporting creates a file/document under the user's control. DiceLab does not automatically upload exported files.

Browser builds use the browser's normal download mechanism. Tauri desktop/mobile builds open the operating-system save/document picker and write only to the destination selected by the user through DiceLab's bounded native export command.

On Android, a selected destination can be represented by a document-provider `content://` URI. On iOS/iPadOS, a selected file can involve security-scoped access. Those native destination details remain behind the Rust/plugin boundary and are not used to introduce broad renderer filesystem permissions.

## Network behavior

The shipping product is intended to perform its core workflows without network access. Links in the About/documentation areas can open external websites only when the user chooses them. Development tools, dependency installers, store tooling, signing/notarization tooling, and GitHub workflows may use the network as part of software development or distribution; those are separate from ordinary local dice rolling.

## Randomness

Secure mode uses the native secure random implementation when running in Tauri and Web Crypto in the browser companion. Seeded mode intentionally uses a deterministic sequence so a test or demonstration can be reproduced. A seed should not be treated as a secret or used as an authentication credential.

## No account requirement

DiceLab does not require registration or sign-in for its core features.

Google Play/App Store accounts, developer signing identities, and CI credentials used by maintainers for distribution are development/release infrastructure and are not DiceLab end-user accounts.

## Clearing data

The Settings screen includes a local-data reset. Browser users may also clear site storage through browser controls. Mobile/desktop users can additionally remove the app according to their operating system's normal application-data behavior. Removing application/browser storage deletes DiceLab's local state, but previously exported files remain wherever the user saved them.

## Sensitive information

DiceLab is not intended to store passwords, authentication tokens, private keys, payment information, or other sensitive records. Do not place sensitive information into preset names or deterministic seeds.

Local diagnostics are designed to redact sensitive key families and avoid serializing raw exception messages/stacks. Native export failure messages shown in the UI are generic and should not expose private selected paths, file URLs, or Android content-provider URIs.

## Third-party links and document providers

Documentation and About screens may link to GitHub, email providers through `mailto:` links, and Buy Me a Coffee. Once a user opens an external service, that service's own privacy terms apply.

Operating-system file/document pickers can also expose local or third-party storage providers chosen/configured by the user. DiceLab does not automatically upload exports to such a provider; when the user deliberately selects a provider destination, the operating system/provider handles that storage relationship according to its own terms and configuration.

## Changes

Material privacy changes should be documented in this file and in release notes.

## Contact

Privacy questions can be sent to:

- `sanskarin@outlook.in`
- `supportramsandesh@gmail.com`

**Made by the Sanskar**
