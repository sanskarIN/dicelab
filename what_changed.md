# DiceLab — Current Work Handoff

Last updated: **2026-08-23**

Current release-preparation target: **2.0.12** (`v2.0.12`)

This file is the current continuation entry point. It records what is implemented, what changed during the cross-platform expansion, PWA hardening, exact-probability expansion, and local preset-sharing work, what was directly observed from repository state, and what still requires candidate execution/device/signing evidence.

## Historical handoffs

Detailed earlier work remains preserved in:

1. [`docs/handoffs/2026-08-19-pre-native-exports.md`](docs/handoffs/2026-08-19-pre-native-exports.md)
2. [`docs/handoffs/2026-08-19-native-localization.md`](docs/handoffs/2026-08-19-native-localization.md)
3. [`docs/handoffs/2026-08-19-policy-hardening.md`](docs/handoffs/2026-08-19-policy-hardening.md)
4. [`docs/handoffs/2026-08-19-documentation-completion.md`](docs/handoffs/2026-08-19-documentation-completion.md)

The handoff index is [`docs/handoffs/README.md`](docs/handoffs/README.md).

---

## 2026-08-23 exact probability + portable preset continuation

This continuation moved beyond release-only paperwork and completed additional product-level offline features while preserving DiceLab's current privacy/security boundaries.

### Exact probability insights

New domain module `src/domain/probability-insights.ts` derives additional statistics from an already guarded exact `ProbabilityDistribution`:

- P25/P50/P75 lower exact quantiles;
- median;
- all tied modes using exact `ways` counts;
- probability-weighted variance;
- standard deviation;
- exact `P(X = n)`;
- at-most `P(X ≤ n)`;
- at-least `P(X ≥ n)`;
- validated arbitrary quantile lookup in `[0, 1]`.

The probability UI now presents quartiles and standard deviation and includes a bounded integer threshold explorer. Changing the main expression resets the interactive threshold to the rounded expected value of the newly accepted distribution.

These features do not bypass the exactness/complexity guards in `src/domain/probability.ts`; they operate only on distributions that the existing exact calculator successfully constructs.

### Exact distribution comparison

New domain module `src/domain/probability-comparison.ts` compares two independently generated exact distributions and returns:

- `P(A > B)`;
- `P(A = B)`;
- `P(A < B)`;
- `E[A] - E[B]`.

The comparison uses ordered distribution points rather than enumerating every raw cross-product pair. Tiny floating-point artifacts at zero/one boundaries are normalized without changing the source distribution exactness policy.

`ProbabilityPanel` now exposes a second expression field for this comparison and preserves the previous valid comparison when a newly entered comparison expression is rejected.

### Shareable preset files

New service module `src/services/preset-file.ts` adds a narrow, versioned local preset-sharing format distinct from full backup/restore:

```ts
interface DiceLabPresetFile {
  kind: 'dicelab-presets';
  schemaVersion: 1;
  exportedAt: string;
  presets: Array<{
    name: string;
    expression: string;
    description?: string;
  }>;
}
```

The sharing boundary now:

- exports only custom presets;
- excludes application-owned built-ins;
- excludes local preset IDs and local creation timestamps;
- parser-normalizes shared dice expressions;
- caps files at 1,000,000 UTF-8 bytes;
- caps files at 500 preset entries;
- checks selected `File.size` before reading oversized files;
- validates root kind/schema/export timestamp/text bounds/expression validity;
- trims imported name/description text;
- gives imported presets fresh collision-safe local IDs and a new local creation timestamp;
- modifies presets only, not history/settings/locale/onboarding.

`RollWorkspace` now exposes localized preset export/import controls and safe success/failure status. `App.tsx` routes preset-file output through the existing runtime-aware `saveTextExport` boundary, so browser builds use the normal download path and Tauri builds continue to use the existing bounded OS-dialog native command.

### Preset ID hardening

Custom preset creation/import now uses one centralized ID helper:

- `crypto.randomUUID()` when available;
- timestamp + monotonic local sequence fallback otherwise.

This replaces timestamp-only custom preset identifiers and reduces same-millisecond collision risk.

### English/Hindi catalog repair and expansion

Preset transfer controls/status are available in both reviewed catalogs.

During integration, a pre-existing catalog mismatch was found: `SettingsPanel` referenced installed-version/release-navigation/manual-update message keys that were absent from the catalogs. Matching English and Hindi keys were restored, and catalog regression tests now guard both the preset-transfer and release/version message surfaces.

### Test coverage added

New/expanded tests cover:

- 2d6 median/mode/variance/standard deviation;
- tied modes for uniform dice;
- threshold probabilities and out-of-range threshold boundaries;
- quantile boundaries and invalid quantile rejection;
- symmetric and asymmetric pairwise distribution comparison;
- non-overlapping comparison distributions;
- normalized comparison mass;
- ProbabilityPanel quartiles/standard deviation/threshold interaction;
- ProbabilityPanel A/B comparison and invalid-comparison recovery;
- preset-file built-in exclusion;
- preset-file round-trip normalization;
- invalid kind/schema/timestamp/expression rejection;
- pre-read oversized preset-file rejection;
- localized preset transfer controls/status;
- privacy-safe transfer failure feedback;
- application-level shared preset import → local persistence → use → re-export journey;
- English/Hindi release/preset catalog keys.

### Documentation synchronized

The continuation updated:

- [`ROADMAP.md`](ROADMAP.md) — records completed probability/preset-sharing work and fixes the stale Cargo-lock regeneration checkbox;
- [`README.md`](README.md) — describes expanded probability workspace and portable presets in the user-facing view matrix;
- [`CHANGELOG.md`](CHANGELOG.md) — records new 2.0.12 candidate features/fixes without claiming publication;
- [`docs/repository-file-reference.md`](docs/repository-file-reference.md) — registers every newly tracked production/test module so the exhaustive inventory gate remains synchronized;
- [`docs/code-reference.md`](docs/code-reference.md) — documents new module ownership/dependency routing;
- [`docs/data-contracts.md`](docs/data-contracts.md) — defines the preset-file schema/bounds and derived/comparison probability semantics, and corrects the Cargo direct-dependency description to include both dialog and filesystem plugins;
- this handoff.

### Representative commits from this continuation

Probability implementation/testing:

- `d5535261` — `feat(probability): add distribution insight helpers`
- `4bf4c0f9` — `test(probability): cover distribution insight helpers`
- `e7f5d2ab` — `feat(probability): surface exact distribution insights`
- `80c7a42b` — `feat(probability): add exact threshold explorer`
- `43d122af` — `ui(probability): refine responsive insight layout`
- `44cf0265` — `test(probability): cover insight and threshold UI`
- `3976ae7d` — `feat(probability): add exact distribution comparison`
- `642c48b9` — `test(probability): cover exact distribution comparison`
- `afe81ec8` — `feat(probability): add distribution comparison workspace`
- `5ac0c992` — `test(probability): cover comparison workspace`

Preset sharing/localization/testing:

- `11ad3a9e` — `feat(presets): add shareable preset file format`
- `9946078c` — `test(presets): cover shared preset file validation`
- `8700d9f9` — `refactor(presets): centralize collision-safe preset ids`
- `608ddc22` — `i18n(presets): localize preset file transfer`
- `79091dae` — `fix(i18n): restore settings release messages`
- `c2722875` — `fix(i18n): restore Hindi release messages`
- `ad3b92dc` — `feat(presets): add preset transfer controls`
- `33c06a78` — `feat(presets): wire preset file import and export`
- `81b67c81` — `test(presets): cover preset transfer controls`
- `ac5074cf` — `test(i18n): guard transfer and release catalog entries`

Repository/documentation synchronization includes additional focused commits for roadmap, tracked-file inventory, README, maintainer code reference, data contracts, changelog, and this handoff rather than collapsing documentation into one commit.

### Verification truth for this continuation

Source changes and committed regression tests are directly observable in the repository.

This execution environment could not clone/install the repository locally because its container could not resolve `github.com`. Therefore this continuation does **not** claim a locally observed green `npm ci`/format/lint/test/build/Rust suite.

Likewise, committed CI configuration or the existence of tests is not proof that the exact latest candidate has passed. Final-candidate green CI/browser/native/fuzz/benchmark/device evidence remains part of the release gate below.

---

## 2026-08-20 PWA / browser-install hardening continuation

After the native Windows/macOS/Linux/Android/iOS cross-platform expansion, the browser target was strengthened from a normal Vite companion into an installable production PWA without changing the native Tauri trust boundary.

### Browser install and offline implementation

The repository now includes:

- `public/manifest.webmanifest` with standalone install metadata;
- `public/dicelab-icon.svg` browser branding;
- standard 192×192 and 512×512 PNG install icons;
- maskable purpose on the 512×512 icon;
- a dedicated 180×180 Apple touch icon;
- iOS/iPadOS home-screen metadata;
- `viewport-fit=cover` so existing safe-area CSS works correctly in edge-to-edge browser/home-screen layouts;
- `public/sw.js` with a versioned DiceLab cache;
- `src/services/pwa.ts` with production-only, non-Tauri service-worker registration;
- HTTPS-or-reviewed-loopback registration rules;
- unit tests for the registration boundary;
- a dependency-free PWA integrity audit and self-tests.

The service worker precaches both the stable shell and the generated content-hashed Vite `/assets/` files discovered from the built `index.html`. This avoids relying on the browser's ordinary HTTP cache for the first offline reopen.

### Real offline browser evidence path

`scripts/e2e-browser.mjs` now extends the existing production Chromium journey by:

1. waiting for the DiceLab `/sw.js` controller;
2. confirming a versioned `dicelab-*` cache exists;
3. confirming generated `/assets/` runtime files are cached;
4. stopping the Vite preview process;
5. performing a cache-bypassing page reload with the server unavailable;
6. confirming DiceLab renders from the service-worker cache;
7. confirming restored roll history remains available after the offline reopen.

The preview-process shutdown lifecycle was also hardened so signal-based exits are distinguished from normal exits and the file again has the final newline required by formatting hygiene.

### Policy and CI hardening

PWA integrity is now enforced through multiple existing repository gates rather than a one-off check:

- the normal CI web-quality job runs `policy:pwa:test` and `policy:pwa` before dependency installation;
- the dependency-free repository-audit workflow runs the same PWA self-test/audit;
- the focused repository-policy workflow now watches PWA, manifest, lock, native, and policy inputs and runs the canonical `policy:test` + `policy:all` commands;
- the tag/manual release-policy workflow also uses the canonical `policy:test` + `policy:all` commands;
- `policy:test` now includes the PWA auditor self-test;
- `policy:all` includes the PWA integrity audit.

This reduces policy drift: future additions to the canonical package scripts automatically flow into the focused/release policy workflows instead of requiring several duplicated hard-coded command lists.

### PWA/release documentation

The following release-facing documents now describe the browser-install/offline path and its evidence boundaries:

- [`README.md`](README.md) — installable PWA/ChromeOS support and current lock status;
- [`docs/web-pwa.md`](docs/web-pwa.md) — source-of-truth PWA architecture, caching, security, install behavior, CI, and manual verification;
- [`docs/release-blockers-current.md`](docs/release-blockers-current.md) — candidate PWA/offline/install evidence blockers;
- [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md) — fields/checklists for automated offline reopen, production deployment, install UI, icons, secure origin, packaging, screenshots, accessibility, and Tauri exclusion;
- [`docs/README.md`](docs/README.md) — documentation-hub link to the PWA guide;
- [`docs/repository-file-reference.md`](docs/repository-file-reference.md) — exhaustive tracked-file entries for the new PWA assets/source/tests/audit.

### Key PWA hardening commits

- `ed7167fe` — `build: add Vite client type declarations`
- `bbac6028` — `feat(web): add installable app icon`
- `ffabf486` — `feat(web): add PWA manifest`
- `de06d898` — `feat(web): add offline service worker`
- `cf784b9c` — `feat(web): add guarded PWA registration service`
- `f6cdf583` — `test(web): cover PWA registration boundaries`
- `a24e925d` — `feat(web): register offline service worker`
- `d24628fb` — `feat(web): wire install metadata and iOS safe areas`
- `02c641a3` — `chore(web): add PWA integrity audit`
- `3d3acfe3` — `test(web): cover PWA integrity audit`
- `99158d47` — `build(web): expose PWA audit commands`
- `ae376443` — `build(web): syntax-check service worker in audit`
- `ca56b08e` — `ci(web): enforce PWA integrity`
- `fa2e45ae` — `feat(web): publish install-ready PNG icons`
- `98e963ae` — `feat(web): add iOS home-screen icon metadata`
- `d1ae4107` — `feat(web): cache complete install asset set`
- `3ae8744a` — `chore(web): harden install asset audit`
- `c289d0c8` — `test(web): enforce production install icon contract`
- `a692c6e6` — `docs(web): document installable offline web target`
- `5aaa8f2f` — `docs(web): register PWA files in exhaustive inventory`
- `486fe638` — `docs(web): link PWA guide from documentation hub`
- `b29e26fc` — `docs(web): document installable PWA and current lock status`
- `f6795ef3` — `fix(web): precache generated Vite runtime assets`
- `b1ebc211` — `chore(web): require generated runtime precaching`
- `75dfb74d` — `test(web): protect generated runtime precaching`
- `e3a8b1c4` — `test(web): verify production PWA offline reopen`
- `29761424` — `test(policy): include PWA auditor in aggregate self-tests`
- `0c42d4e1` — `ci(policy): include PWA boundaries in focused audit`
- `844a43c4` — `ci(release): unify tag policy audits with canonical scripts`
- `a1728d86` — `fix(e2e): harden preview shutdown lifecycle`
- `d6d88f42` — `docs(web): align PWA guide with offline E2E`
- `b7e27822` — `ci(policy): unify focused policy workflow with canonical scripts`
- `7af6f2ab` — `ci(audit): include PWA repository invariants`
- `602fc7ca` — `docs(release): add PWA candidate evidence gates`
- `a4bde08a` — `docs(release): add PWA evidence checklist`

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
| Modern browsers / ChromeOS | React/Vite installable PWA | implemented |

“Implemented” here means the repository contains the target configuration, commands, native/runtime or browser-install support, CI/release build path, and documentation. It does **not** mean every store/signing/device/browser-install release gate has already been observed on the final candidate.

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

### Web / PWA

```bash
npm run dev
npm run build
npm run policy:pwa:test
npm run policy:pwa
npm run test:e2e
```

`npm run dev` deliberately does not register the service worker. Production PWA behavior is validated from the built application.

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
- pre-install PWA auditor self-test and PWA integrity audit;
- locked `npm ci`;
- docs links;
- Prettier;
- ESLint;
- unit/integration tests;
- production Vite build;
- real Chromium CDP E2E including PWA cache inspection and server-offline reopen.

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

Additional repository-wide policy/audit workflows now run the canonical PWA checks as described above.

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

The release web verification runs canonical repository policy checks, which now include the PWA integrity boundary and its generated-asset precaching requirements.

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

### Browser / PWA

The browser/PWA distribution path has no native package-signing requirement, but normal non-loopback service-worker registration requires a secure HTTPS origin. Browser/ChromeOS/Android/iOS install UI and offline behavior remain candidate evidence items rather than assumptions from source configuration.

Do not change docs to call unsigned CI outputs “store ready.”

---

## What is directly observed in this continuation

Observed from repository source/state after the combined cross-platform/PWA/probability/preset work:

- `package.json` exposes web, desktop, Android, and iOS command surfaces;
- `package.json` exposes PWA audit/self-test commands and includes the PWA auditor in aggregate policy self-tests;
- Tauri configuration sets Android API 24 and iOS 14.0 minimums;
- capability JSON explicitly covers Linux/macOS/Windows/Android/iOS and retains only `core:default`;
- Rust manifest directly includes `tauri-plugin-fs`;
- Rust native code uses Tauri `FilePath`/filesystem handling for selected native export destinations;
- `src/mobile.css` is tracked and loaded by `src/main.tsx`;
- the web target includes a manifest, service worker, standard PNG install icons, Apple touch icon, and guarded production registration;
- the service worker discovers and precaches generated same-origin Vite `/assets/` runtime files;
- the browser E2E source explicitly verifies PWA controller/cache state, stops the preview process, reloads offline, and checks persisted history;
- normal CI includes Android and iOS build jobs plus PWA policy/offline E2E checks;
- focused repository-policy and dependency-free repository-audit workflows include PWA boundaries;
- the release-policy workflow uses canonical `policy:test` + `policy:all` commands;
- tagged release includes Android and iOS artifact jobs and requires them before draft packaging;
- exact probability insight/threshold/comparison domain modules and tests are tracked;
- the probability workspace presents quantiles, standard deviation, threshold probabilities, and pairwise comparison;
- the versioned bounded preset-file service and its tests are tracked;
- preset import/export is wired through the roll workspace and existing runtime-aware save boundary;
- English/Hindi catalogs contain the preset-transfer and Settings release/version keys referenced by UI;
- application integration coverage contains the preset import/persist/use/re-export journey;
- README/changelog/roadmap/code/data/file-reference documentation describes the new probability and preset behavior;
- `package-lock.json` application versions are 2.0.12;
- DiceLab's generated Cargo lock package is 2.0.12;
- DiceLab's generated Cargo dependency list contains `tauri-plugin-dialog` and `tauri-plugin-fs`.

Not yet claimed as observed final-candidate evidence:

- all CI jobs green on the exact latest candidate commit;
- full browser/PWA E2E green on that exact commit;
- a deployed HTTPS PWA install reviewed on representative desktop/ChromeOS/browser environments;
- representative Android-browser install/add-to-home-screen evidence;
- representative iOS/iPadOS Add to Home Screen evidence;
- locked Rust test/Clippy green on that exact commit after all changes;
- Android physical-device smoke;
- Android system/cloud-provider export compatibility evidence;
- iPhone physical-device smoke;
- iPad physical-device smoke;
- mobile/browser screen-reader/accessibility review;
- parser fuzz campaign on the final candidate;
- benchmark record on the final candidate;
- Windows/macOS/Linux packaged smoke on the final candidate;
- CodeQL/dependency/repository-security review on the final candidate;
- real release screenshots including a representative installed/standalone PWA view;
- Windows/macOS signing/notarization status;
- Android production signing/Google Play publication;
- iOS App Store signing/publication;
- final draft artifact checksum/provenance verification;
- explicit release APPROVE decision;
- publication of `v2.0.12`.

---

## Remaining release gate

Generated dependency locks are no longer the first blocker. Continue release verification in this order:

1. observe the final normal CI web/Rust/Android/iOS jobs green on the exact candidate commit, including the newly added probability/preset tests and documentation inventory;
2. observe production browser/PWA E2E green, including the generated-runtime cache check and server-offline reopen;
3. verify the actual production HTTPS PWA install path on representative desktop/ChromeOS plus Android/iOS browser/home-screen flows where supported;
4. observe locked Rust fmt/test/Clippy green after all cross-platform/PWA changes;
5. run/observe the bounded Rust parser fuzz campaign;
6. record benchmark evidence;
7. build and smoke Windows/macOS/Linux artifacts;
8. run physical Android smoke including `content://` document-provider export;
9. run physical iPhone/iPad smoke including safe areas, orientation, persistence, Files-picker export, and security-scoped access return;
10. complete English/Hindi/accessibility/security review across native and installed-browser layouts, including new preset transfer and probability controls;
11. capture real candidate screenshots, including representative installed/standalone PWA evidence;
12. record actual signing/notarization/store/deployment status without overstating unsigned artifacts or unobserved browser behavior;
13. trigger the tagged draft release only from the verified commit;
14. verify every ZIP/checksum/provenance record and web install/offline artifact contents;
15. fill [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md);
16. publish `v2.0.12` only after explicit maintainer **APPROVE**.

---

## Important future-maintainer rules

- Keep Android minimum API/iOS minimum version changes deliberate and documented.
- Keep the renderer capability narrow; do not add generic filesystem permission merely because the Rust side uses the filesystem plugin.
- Keep Android `content://` handling behind `FilePath`/native abstractions; do not convert provider URIs into local paths.
- Keep iOS selected-file security scope lifecycle explicit.
- Preserve safe-area and coarse-pointer mobile CSS when restructuring layout/navigation.
- Keep service-worker registration production-only and excluded from all Tauri runtimes.
- Keep PWA caching same-origin; do not introduce remote runtime/CDN dependencies without an explicit architecture/security review.
- Keep generated build-asset precaching restricted to the production `/assets/` namespace.
- Increment the service-worker cache generation when the precached shell changes materially.
- Preserve the real-browser server-offline reopen step when modifying E2E lifecycle/process control.
- Keep probability insight/comparison modules pure and consume only distributions produced by the guarded exact calculator rather than adding unreviewed approximate paths.
- Keep the shareable preset schema separate from full backup state; do not add local IDs/history/settings/seeds to preset files without an explicit compatibility/privacy review and schema version change.
- Preserve pre-read size rejection for imported backup and preset files.
- Keep preset import/export user errors localized and avoid exposing raw selected path/URI/exception details.
- Keep canonical `policy:test` and `policy:all` scripts synchronized with any new executable policy and let focused/release workflows call those canonical scripts rather than duplicating command lists.
- When `Cargo.toml` or `package.json` dependency declarations change, regenerate lockfiles using package-manager automation.
- Treat CI configuration and committed tests as implementation, not as proof of a passing candidate.
- Never commit Android/iOS/store signing credentials.
- Do not call unsigned Android/iOS workflow artifacts store-ready.
- Keep README, setup, release, release blockers, changelog, roadmap, PWA guide, code/data references, release-evidence template, and exhaustive file inventory synchronized when platform/product behavior changes.

---

## Canonical references

- [`README.md`](README.md)
- [`CHANGELOG.md`](CHANGELOG.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`docs/README.md`](docs/README.md)
- [`docs/setup.md`](docs/setup.md)
- [`docs/web-pwa.md`](docs/web-pwa.md)
- [`docs/native-exports.md`](docs/native-exports.md)
- [`docs/release.md`](docs/release.md)
- [`docs/release-blockers-current.md`](docs/release-blockers-current.md)
- [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md)
- [`docs/automation-reference.md`](docs/automation-reference.md)
- [`docs/repository-file-reference.md`](docs/repository-file-reference.md)
- [`docs/code-reference.md`](docs/code-reference.md)
- [`docs/data-contracts.md`](docs/data-contracts.md)
- [`docs/capability-policy.md`](docs/capability-policy.md)
- [`docs/testing.md`](docs/testing.md)
- [`docs/lockfile-policy.md`](docs/lockfile-policy.md)

**Made by the Sanskar**
