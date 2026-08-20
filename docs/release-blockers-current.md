# DiceLab Current Release Blockers

Current candidate: **2.0.12** (`v2.0.12`)

Last reviewed: 2026-08-20

This file separates **implemented product/repository work** from **release evidence that still must be observed**. A configured workflow or compilable-looking source change is not treated as passing evidence until it is actually observed on the intended candidate commit.

## Resolved — generated dependency lock synchronization

The generated dependency-lock blocker is now closed.

Current observed npm state:

```text
package.json version                  2.0.12
package-lock.json top-level version   2.0.12
package-lock.json packages[""]        2.0.12
```

Current observed Cargo package block:

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

This includes the direct `tauri-plugin-fs` dependency introduced for cross-platform native export handling. The generated Cargo lock must continue to be treated as package-manager output rather than hand-edited dependency metadata.

The lockfile workflow remains responsible for regenerating npm/Cargo locks after manifest changes, verifying locked Cargo metadata and synchronized application versions, checking generated diff hygiene, and committing the generated locks to `main` or the `automation/lockfiles` fallback branch when required.

## Blocker 1 — Observed full CI on the cross-platform candidate

The repository now configures normal CI for:

- web quality and production real-browser E2E;
- locked Rust formatting/tests/Clippy;
- Android ARM64 native APK/AAB compilation;
- iOS Apple-Silicon simulator compilation.

The configuration itself is implemented. Release readiness still requires those jobs to be observed green for the exact final 2.0.12 candidate commit after all cross-platform changes and documentation updates are present.

Required evidence:

- exact candidate source commit;
- successful web job;
- successful Rust job;
- successful Android job;
- successful iOS simulator job;
- no ignored required failure/retry that changes the candidate commit.

## Blocker 2 — Observed full browser E2E

The production real-browser journey is implemented, but 2.0.12 release evidence requires an observed successful run on infrastructure that permits the required local preview/browser navigation.

Required evidence:

- exact 2.0.12 source commit;
- browser/runtime versions;
- successful E2E workflow/run identifier or preserved local output;
- no skipped primary journey steps.

## Blocker 3 — Observed parser fuzz campaign

The cargo-fuzz harness and scheduled/manual workflow are implemented.

2.0.12 release evidence still requires an observed bounded campaign on the intended candidate, with no unresolved crash/invariant artifact.

Any discovered reproducible case should become a deterministic Rust regression before release.

## Blocker 4 — 2.0.12 benchmark record

`npm run bench` is implemented, but timing values are only meaningful when recorded with:

- exact source commit;
- hardware;
- operating system;
- Node/npm versions;
- complete benchmark output.

The 2.0.12 candidate needs an actual recorded run rather than an assumed performance claim.

## Blocker 5 — Desktop candidate builds and smoke evidence

Windows, macOS, and Linux 2.0.12 candidate artifacts must each be built from the intended source commit and smoke-tested.

For every supported desktop candidate verify at least:

- application launches;
- About/Settings show version `2.0.12`;
- secure roll path works;
- deterministic seeded reference behavior matches the web companion;
- settings persist;
- English/Hindi switching persists;
- native History CSV save works;
- native History JSON save works;
- native backup save works;
- canceling native save creates no file and no false error;
- backup restore works;
- contact/project data is correct;
- reduced-motion/keyboard behavior is usable;
- native errors do not expose a private selected filesystem path.

## Blocker 6 — Android physical-device evidence

DiceLab now has an Android Tauri target with Android API 24 minimum, Android init/dev/build scripts, safe-area/touch UI behavior, native Rust mobile entry, and CI/release build jobs.

A compiler result alone is not enough for release. On at least one representative physical Android device, record:

- launch/startup and version display;
- secure and deterministic seeded rolls;
- local history/settings/locale persistence across restart;
- portrait and landscape layout behavior;
- bottom navigation and 44px coarse-pointer target usability;
- English/Hindi switching and 200% text scaling where the device permits it;
- History CSV/JSON export through the system document picker;
- backup export and restore;
- successful handling of an Android `content://` document-provider destination;
- cancellation behavior;
- a provider/write failure showing generic localized feedback without leaking a private URI/raw native error.

Cloud/vendor document providers can behave differently from the local Documents/Downloads provider, so at least the system provider must be included in the release record and any additional provider limitations must be documented accurately.

## Blocker 7 — iPhone/iPad physical-device evidence

DiceLab now has an iOS/iPadOS Tauri target with iOS 14.0 minimum, iOS init/dev/build/simulator/archive scripts, safe-area/touch UI behavior, native Rust mobile entry, and CI/release build jobs.

Before release, record physical-device evidence for representative iPhone and iPad form factors:

- launch/startup and version display;
- secure and deterministic seeded rolls;
- local history/settings/locale persistence across restart;
- portrait/landscape and safe-area behavior;
- English/Hindi switching;
- History CSV/JSON export through the Files picker;
- backup export and restore;
- cancellation behavior;
- successful return from the file picker after security-scoped access is released;
- user-safe failure feedback without private selected file details.

The CI simulator build and unsigned device archive validate buildability, not App Store distribution readiness.

## Blocker 8 — Accessibility/manual localization review

Automated tests do not replace candidate review.

Still required for the 2.0.12 build across representative desktop/mobile layouts:

- keyboard-only desktop primary journey;
- touch primary journey on Android/iOS;
- focus visibility/order;
- modal focus trapping/restoration where keyboard interaction applies;
- 200% text scaling;
- safe-area/notch/home-indicator review;
- reduced-motion review;
- representative screen-reader labels/landmarks;
- English layout review;
- Hindi layout review.

## Blocker 9 — Repository/security evidence

The repository contains executable policy audits for:

- cross-platform native capabilities;
- Tauri CSP/remote IPC;
- offline CSP network sources;
- localized formatting boundary;
- native runtime boundary;
- native command contract;
- dependency lock consistency;
- generated-lock-aware application version agreement;
- exhaustive tracked-file documentation inventory.

The tag-driven release workflow also runs documentation inventory and repository policy gates directly before artifact production. Release readiness still requires observed successful 2.0.12 candidate runs plus review of:

- secret scanning;
- CodeQL/code scanning;
- dependency alerts;
- repository security settings;
- release workflow permissions;
- confirmation that renderer capabilities did not gain broad filesystem/shell/HTTP/process access while adding mobile export support.

## Blocker 10 — Real 2.0.12 candidate screenshots

README/release screenshots must be captured from verified candidate builds rather than mocked or development-only representations.

Required minimum set:

- Dice Studio;
- History;
- Probability;
- Settings showing 2.0.12;
- representative Hindi interface;
- representative Android phone view;
- representative iPhone view;
- representative iPad/tablet view.

## Blocker 11 — Signing, notarization, and store status

Signing/distribution credentials are intentionally not stored in the repository.

Before publication, accurately record the actual state of:

- Windows signing, if configured;
- macOS signing/notarization, if configured;
- Android APK/AAB signing and Google Play registration;
- iOS distribution signing/provisioning and App Store Connect registration.

The current mobile release jobs intentionally produce **release-validation artifacts**. The Android workflow output and unsigned iOS `.xcarchive` must not be described as store-ready unless a separate reviewed signing/distribution process has actually been completed.

Never commit signing credentials, Android keystores, Apple certificates/private keys, provisioning secrets, or store API credentials.

## Blocker 12 — Artifact/checksum/provenance review

Before publishing the 2.0.12 draft release:

- download produced web/Windows/macOS/Linux/Android/iOS artifact packages;
- verify SHA-256 checksums;
- inspect expected package contents;
- verify `RELEASE-METADATA.json` reports tag `v2.0.12`, the exact source commit, and workflow identity;
- confirm Android/iOS artifact labels accurately state signing/archive status;
- confirm release notes match `CHANGELOG.md`;
- confirm signing claims match reality.

## Cross-platform implementation completed before candidate verification

The 2026-08-20 cross-platform implementation wave added or updated:

- Android Tauri configuration with API 24 minimum;
- iOS/iPadOS Tauri configuration with iOS 14.0 minimum;
- explicit native capability scope for Linux, macOS, Windows, Android, and iOS while retaining only `core:default` renderer permission;
- Android init/dev/APK+AAB npm commands;
- iOS init/dev/build/simulator/unsigned-archive npm commands;
- normal CI Android ARM64 and iOS simulator compilation jobs;
- tagged release universal Android APK/AAB validation job;
- tagged release unsigned iOS device archive job;
- draft-release dependency on successful web, desktop, Android, and iOS artifact jobs;
- mobile safe-area, dynamic-viewport, coarse-pointer target, and compact-landscape CSS;
- native export writes through Tauri's `FilePath`/filesystem abstraction so Android `content://` selections are not treated as ordinary paths;
- explicit iOS release of security-scoped selected-file access after writing;
- cross-platform setup/release/native-export/README/roadmap/inventory documentation;
- generated Cargo lock synchronization including the direct `tauri-plugin-fs` dependency.

These are implementation/configuration changes, not substitutes for the execution evidence listed above.

## Final publication gate

`v2.0.12` should be published only after the candidate evidence is complete enough for a maintainer to choose **APPROVE** in a filled copy of:

- [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md)

## Handoff references

- [`../what_changed.md`](../what_changed.md)
- [`handoffs/README.md`](handoffs/README.md)
- [`lockfile-policy.md`](lockfile-policy.md)
- [`release.md`](release.md)
- [`testing.md`](testing.md)
- [`../ROADMAP.md`](../ROADMAP.md)
