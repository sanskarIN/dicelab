# DiceLab — Current Work Handoff

Last updated: **2026-08-20**

Current release-preparation target: **2.0.12** (`v2.0.12`)

This file is the current continuation entry point. It records what is implemented, what changed during the cross-platform expansion, what was directly observed, and what still requires candidate execution/device/signing evidence.

## Historical handoffs

Detailed earlier work remains preserved in:

1. [`docs/handoffs/2026-08-19-pre-native-exports.md`](docs/handoffs/2026-08-19-pre-native-exports.md)
2. [`docs/handoffs/2026-08-19-native-localization.md`](docs/handoffs/2026-08-19-native-localization.md)
3. [`docs/handoffs/2026-08-19-policy-hardening.md`](docs/handoffs/2026-08-19-policy-hardening.md)
4. [`docs/handoffs/2026-08-19-documentation-completion.md`](docs/handoffs/2026-08-19-documentation-completion.md)

The handoff index is [`docs/handoffs/README.md`](docs/handoffs/README.md).

---

## 2026-08-20 cross-platform objective

The repository previously shipped/configured only:

- Windows Tauri desktop;
- macOS Tauri desktop;
- Linux Tauri desktop;
- Vite browser companion.

The requested continuation was to make DiceLab fully cross-platform from the same project rather than only documenting future mobile intent.

The source/build surface now targets:

| Platform | DiceLab target | Current source/config state |
| --- | --- | --- |
| Windows | Tauri 2 desktop | implemented |
| macOS | Tauri 2 desktop | implemented |
| Linux | Tauri 2 desktop | implemented |
| Android | Tauri 2 mobile | implemented, Android API 24+ |
| iOS/iPadOS | Tauri 2 mobile | implemented, iOS/iPadOS 14.0+ |
| Modern browsers | React/Vite web companion | implemented |

“Implemented” here means the repository contains the target configuration, commands, native/runtime support, CI/release build path, and documentation. It does **not** mean every store/signing/device release gate has already been observed on the final candidate.

---

## Cross-platform commits made in this continuation

The mobile/cross-platform expansion was intentionally split into granular commits rather than one large undifferentiated change.

### Mobile command/config foundation

- `0b3dff09` — `build: add mobile Tauri commands`
  - changed the npm project description to desktop/mobile/web;
  - added Android init/dev/build commands;
  - added iOS init/dev/build commands.

- `9b619cc3` — `build: define Android and iOS baselines`
  - added `bundle.android.minSdkVersion = 24`;
  - added `bundle.iOS.minimumSystemVersion = "14.0"`.

- `c497e84d` — `security: scope main capability across all targets`
  - retained only `core:default` renderer permission;
  - explicitly scoped the capability to Linux, macOS, Windows, Android, and iOS.

### Cross-platform native export implementation

- `095e0198` — `native: add cross-platform filesystem adapter`
  - added direct `tauri-plugin-fs = "2.5.1"` Rust dependency;
  - retained the dialog plugin;
  - did not add broad renderer filesystem capability.

- `f4e60061` — `fix: support mobile export file URIs`
  - replaced the desktop-only assumption that every selected destination is a normal `std::path::Path`;
  - accepts the operating-system-selected Tauri `FilePath` behind the Rust command;
  - opens/writes through `tauri-plugin-fs`;
  - preserves selected-extension validation when the destination resolves to a normal path;
  - supports Android document-provider `content://` selections without sending a URI from the frontend;
  - explicitly releases iOS security-scoped selected-file access after the write;
  - preserves generic safe native error messages that do not reveal private selected destinations;
  - registers the filesystem plugin in the Tauri builder;
  - keeps the existing `#[cfg_attr(mobile, tauri::mobile_entry_point)]` native mobile entry.

### Mobile ergonomics

- `2ed405cb` — `ui: add mobile safe-area and touch rules`
  - added `src/mobile.css`;
  - uses `env(safe-area-inset-*)` around app content, mobile nav, and modal overlays;
  - uses `100dvh` for modern dynamic mobile viewport behavior;
  - applies 44px minimum coarse-pointer targets to important controls;
  - adds compact landscape-phone behavior;
  - disables tap highlight and unwanted vertical overscroll behavior without changing desktop layout.

- `35674142` — `ui: load mobile ergonomics after shared styles`
  - imports `src/mobile.css` after `styles.css` in the React bootstrap.

### iOS CI command correction and archive validation

- `724d4be7` — `fix: use iOS simulator for unsigned CI builds`
  - normal CI uses `tauri ios build --ci --target aarch64-sim` rather than requiring a distribution identity.

- `88375088` — `build: add unsigned iOS archive command`
  - adds `tauri:ios:archive:ci` using the locked Tauri CLI's `--ci --no-sign --archive-only` device-archive validation mode.

### Normal CI expansion

- `f6339a51` — `ci: build Android and iOS targets`
  - added Android CI on Ubuntu;
  - uses Node 22, Java 17, Android NDK discovery, and the Rust Android targets;
  - initializes the generated Android project and builds an ARM64 APK/AAB validation target;
  - added iOS CI on macOS;
  - installs the Apple-Silicon simulator Rust target;
  - initializes the generated Apple project and builds the ARM64 simulator application;
  - retains existing web and locked Rust quality jobs.

### Tagged release expansion

- `ea8bc202` — `release: add Android and iOS build artifacts`
  - keeps web + Windows/macOS/Linux artifact jobs;
  - adds universal Android APK/AAB release-validation artifact generation;
  - adds an unsigned iOS ARM64 device `.xcarchive` validation artifact;
  - makes the draft-release packaging job depend on successful web, desktop, Android, and iOS jobs;
  - labels mobile outputs accurately as unsigned/validation artifacts;
  - preserves per-artifact ZIP packaging, `RELEASE-METADATA.json`, SHA-256 checksums, and draft-only publication behavior.

### Cross-platform documentation

- `d8b321bf` — `docs: document cross-platform development setup`
- `d9d67477` — `docs: extend release process to mobile targets`
- `895cb694` — `docs: inventory mobile platform support files`
- `1de5dddf` — `docs: add cross-platform roadmap milestones`
- `b9ca3f91` — `docs: advertise complete cross-platform target matrix`
- `1721c506` — `docs: explain mobile native export boundary`
- `5f33c3ec` — `docs: refresh blockers after mobile and lock generation`
- `2c61ea3c` — `docs: record cross-platform mobile implementation`

These synchronize README, setup, release, native-export, roadmap, release-blocker, changelog, and exhaustive file-inventory documentation with the actual source/build changes.

---

## Current command surface

### Web

```bash
npm run dev
npm run build
npm run test:e2e
```

### Desktop

```bash
npm run tauri:dev
npm run tauri:build
```

Run desktop builds on the target operating system because Tauri bundles are platform-specific.

### Android

```bash
npm run tauri:android:init
npm run tauri:android:dev
npm run tauri:android:build
```

The default Android build requests APK and AAB output.

For ARM64-only validation:

```bash
npm run tauri:android:build -- --target aarch64
```

### iOS/iPadOS

Requires macOS/Xcode:

```bash
npm run tauri:ios:init
npm run tauri:ios:dev
npm run tauri:ios:build
```

Unsigned/simulator CI validation paths:

```bash
npm run tauri:ios:build:ci
npm run tauri:ios:archive:ci
```

The simulator/unsigned archive commands are build evidence only. They are not App Store-ready signed IPA publication commands.

---

## Native export trust boundary after mobile support

The frontend behavior remains intentionally narrow.

### Browser

The browser companion uses the existing Blob/download implementation.

### Tauri native targets

The frontend calls only the allowlisted `save_text_export` command and supplies:

- bounded suggested filename;
- bounded text contents;
- `csv` or `json` format.

It does **not** send a destination path or URI.

The Rust command:

1. validates suggested filename, payload size, and format;
2. opens the OS save/document dialog;
3. receives the selected `FilePath` from Tauri;
4. validates the selected extension again when the selection can be represented as a normal filesystem path;
5. opens the selected `FilePath` through `tauri-plugin-fs` with create/write/truncate options;
6. writes and synchronizes the contents;
7. on iOS, releases security-scoped resource access;
8. returns only safe success/cancellation/generic-failure information to the UI.

This design fixes the Android `content://` compatibility problem without granting `fs:*` renderer permissions.

---

## Generated dependency locks — synchronized

The previous 2.0.12 handoff had a stale generated-lock blocker. That blocker is now resolved.

Directly observed npm lock metadata:

```text
package-lock.json top-level version   2.0.12
package-lock.json packages[""]        2.0.12
```

Directly observed Cargo package block:

```toml
[[package]]
name = "dicelab"
version = "2.0.12"
dependencies = [
 "rand",
 "regex",
 "serde",
 "serde_json",
 "tauri",
 "tauri-build",
 "tauri-plugin-dialog",
 "tauri-plugin-fs",
]
```

The generated Cargo lock therefore records the new direct mobile filesystem adapter dependency. Do not hand-edit this graph in future continuations; use the existing lockfile workflow/package manager after manifest changes.

---

## Current CI architecture

Normal `.github/workflows/ci.yml` now contains four primary jobs:

### Web quality

- pre-install secret/version/E2E-infrastructure checks;
- locked `npm ci`;
- docs links;
- Prettier;
- ESLint;
- unit/integration tests;
- production Vite build;
- real Chromium CDP E2E.

### Rust quality

- Tauri Linux prerequisites;
- rustfmt;
- locked Rust tests;
- locked Clippy with warnings denied.

### Android build

- Ubuntu runner;
- Node 22;
- Java 17;
- Android Rust targets;
- NDK discovery through the runner SDK;
- `tauri android init` CI generation;
- ARM64 APK/AAB build validation.

### iOS simulator build

- macOS runner;
- Node 22;
- `aarch64-apple-ios-sim` Rust target;
- `tauri ios init` CI generation;
- Apple-Silicon simulator build validation.

Configuration existence is not reported as an observed green result. A final candidate still needs all required jobs observed green on the exact final commit.

---

## Tagged release architecture

`.github/workflows/release.yml` now gates the draft release on:

1. web verification + web artifact;
2. Windows desktop bundle;
3. macOS desktop bundle;
4. Linux desktop bundle;
5. universal Android APK/AAB validation build;
6. unsigned iOS ARM64 device archive validation build.

Only after all prerequisite artifact jobs succeed does the release job:

- download workflow artifacts;
- ZIP each artifact group;
- write `RELEASE-METADATA.json` with repository/tag/source/workflow identity;
- generate `SHA256SUMS.txt`;
- create/update a **draft** GitHub release;
- upload the packages/checksum/provenance files.

The workflow intentionally does not auto-publish the release.

---

## Platform signing/store boundary

### Windows/macOS/Linux

Existing desktop signing/notarization expectations remain release-evidence items where applicable.

### Android

The repository can build Android APK/AAB artifacts, but Google Play publication still requires private signing credentials/keystore and Play Console registration. No Android keystore is committed.

### iOS/iPadOS

The repository can build the simulator and unsigned device archive validation paths, but end-user/App Store distribution still requires Apple Developer/App Store Connect signing/provisioning. No Apple private signing material is committed.

Do not change docs to call unsigned CI outputs “store ready.”

---

## What is directly observed in this continuation

Observed from the repository after the changes:

- `package.json` exposes web, desktop, Android, and iOS command surfaces;
- Tauri configuration sets Android API 24 and iOS 14.0 minimums;
- capability JSON explicitly covers Linux/macOS/Windows/Android/iOS and retains only `core:default`;
- Rust manifest directly includes `tauri-plugin-fs`;
- Rust native code uses Tauri `FilePath`/filesystem handling for selected native export destinations;
- `src/mobile.css` is tracked and loaded by `src/main.tsx`;
- normal CI includes Android and iOS build jobs;
- tagged release includes Android and iOS artifact jobs and requires them before draft packaging;
- README/setup/release/native-export/roadmap/release-blocker/file-reference/changelog documentation describes the cross-platform design;
- `package-lock.json` application versions are 2.0.12;
- DiceLab's generated Cargo lock package is 2.0.12;
- DiceLab's generated Cargo dependency list contains `tauri-plugin-dialog` and `tauri-plugin-fs`.

Not yet claimed as observed final-candidate evidence:

- all CI jobs green on the final post-documentation commit;
- full browser E2E green on that final commit;
- locked Rust test/Clippy green on that final commit after the mobile changes;
- Android physical-device smoke;
- Android system/cloud-provider export compatibility evidence;
- iPhone physical-device smoke;
- iPad physical-device smoke;
- mobile screen-reader/accessibility review;
- parser fuzz campaign on the final candidate;
- benchmark record on the final candidate;
- Windows/macOS/Linux packaged smoke on the final candidate;
- CodeQL/dependency/repository-security review on the final candidate;
- real release screenshots;
- Windows/macOS signing/notarization status;
- Android production signing/Google Play publication;
- iOS App Store signing/publication;
- final draft artifact checksum/provenance verification;
- explicit release APPROVE decision;
- publication of `v2.0.12`.

---

## Remaining release gate

Generated dependency locks are no longer the first blocker. Continue release verification in this order:

1. observe the final normal CI web/Rust/Android/iOS jobs green on the exact candidate commit;
2. observe production browser E2E green;
3. observe locked Rust fmt/test/Clippy green after all mobile changes;
4. run/observe the bounded Rust parser fuzz campaign;
5. record benchmark evidence;
6. build and smoke Windows/macOS/Linux artifacts;
7. run physical Android smoke including `content://` document-provider export;
8. run physical iPhone/iPad smoke including safe areas, orientation, persistence, Files-picker export, and security-scoped access return;
9. complete English/Hindi/accessibility/security review;
10. capture real candidate screenshots;
11. record actual signing/notarization/store status without overstating unsigned artifacts;
12. trigger the tagged draft release only from the verified commit;
13. verify every ZIP/checksum/provenance record;
14. fill [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md);
15. publish `v2.0.12` only after explicit maintainer **APPROVE**.

---

## Important future-maintainer rules

- Keep Android minimum API/iOS minimum version changes deliberate and documented.
- Keep the renderer capability narrow; do not add generic filesystem permission merely because the Rust side uses the filesystem plugin.
- Keep Android `content://` handling behind `FilePath`/native abstractions; do not convert provider URIs into local paths.
- Keep iOS selected-file security scope lifecycle explicit.
- Preserve safe-area and coarse-pointer mobile CSS when restructuring layout/navigation.
- When `Cargo.toml` or `package.json` dependency declarations change, regenerate lockfiles using package-manager automation.
- Treat CI configuration as implementation, not as proof of a passing candidate.
- Never commit Android/iOS/store signing credentials.
- Do not call unsigned Android/iOS workflow artifacts store-ready.
- Keep README, setup, release, release blockers, changelog, roadmap, and exhaustive file inventory synchronized when platform behavior changes.

---

## Canonical references

- [`README.md`](README.md)
- [`CHANGELOG.md`](CHANGELOG.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`docs/README.md`](docs/README.md)
- [`docs/setup.md`](docs/setup.md)
- [`docs/native-exports.md`](docs/native-exports.md)
- [`docs/release.md`](docs/release.md)
- [`docs/release-blockers-current.md`](docs/release-blockers-current.md)
- [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md)
- [`docs/automation-reference.md`](docs/automation-reference.md)
- [`docs/repository-file-reference.md`](docs/repository-file-reference.md)
- [`docs/capability-policy.md`](docs/capability-policy.md)
- [`docs/testing.md`](docs/testing.md)
- [`docs/lockfile-policy.md`](docs/lockfile-policy.md)

**Made by the Sanskar**
