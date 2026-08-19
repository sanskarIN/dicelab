# DiceLab Privacy Notice

_Last updated: 2026-08-19_

DiceLab is designed as an offline-first utility. Normal dice rolling does not require an account, analytics service, advertising SDK, or remote application database.

## Data stored locally

Depending on the platform, DiceLab stores the following in browser/webview local storage:

- recent roll history;
- saved custom presets;
- appearance and accessibility preferences;
- random-mode preference and user-provided deterministic seed;
- first-run onboarding completion state.

This data remains on the device unless the user explicitly exports it or another program/user with access to the device reads the application storage.

## Exports and backups

DiceLab can export roll logs as CSV or JSON and can create a JSON backup containing local history, custom presets, and settings. Exporting creates a file under the user's control. DiceLab does not automatically upload exported files.

## Network behavior

The shipping product is intended to perform its core workflows without network access. Links in the About/documentation areas can open external websites only when the user chooses them. Development tools, dependency installers, update tooling, and GitHub workflows may use the network as part of software development or distribution; those are separate from ordinary local dice rolling.

## Randomness

Secure mode uses the native secure random implementation when running in Tauri and Web Crypto in the browser companion. Seeded mode intentionally uses a deterministic sequence so a test or demonstration can be reproduced. A seed should not be treated as a secret.

## No account requirement

DiceLab does not require registration or sign-in for its core features.

## Clearing data

The Settings screen includes a local-data reset. Browser users may also clear site storage through browser controls. Removing application/browser storage deletes DiceLab's local state, but previously exported files remain wherever the user saved them.

## Sensitive information

DiceLab is not intended to store passwords, authentication tokens, private keys, payment information, or other sensitive records. Do not place sensitive information into preset names or deterministic seeds.

## Third-party links

Documentation and About screens may link to GitHub, email providers through `mailto:` links, and Buy Me a Coffee. Once a user opens an external service, that service's own privacy terms apply.

## Changes

Material privacy changes should be documented in this file and in release notes.

## Contact

Privacy questions can be sent to:

- `sanskarin@outlook.in`
- `supportramsandesh@gmail.com`

**Made by the Sanskar**
