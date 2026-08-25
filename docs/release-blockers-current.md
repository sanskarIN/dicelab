# DiceLab Current Release Blockers

Current candidate: **2.0.14** (`v2.0.14`)

Last reviewed: 2026-08-25

The earlier 2.0.13 candidate was not published. Its completed implementation is carried forward and superseded by 2.0.14. This file separates implemented source/configuration from evidence that still has to be observed on the exact final candidate commit.

## Resolved preparation item — generated lock metadata

The repository lockfile workflow completed successfully for the 2.0.14 source bump and committed generated lock metadata to `main` in `a63945d8` (`build: lock application dependencies`). The workflow regenerated both npm and Cargo locks, verified locked Cargo metadata, verified generated application versions, validated the diff, and committed the result.

Currently observed:

```text
package.json                           2.0.14
src/config/app.ts                     2.0.14
src-tauri/Cargo.toml                  2.0.14
src-tauri/tauri.conf.json             2.0.14
package-lock.json top-level           2.0.14
package-lock.json packages[""]         2.0.14
lockfile workflow                     success
```

The lockfile workflow's generated-version verification also passed for the Cargo application package. This preparation item is no longer a blocker. Future manifest/version changes must still regenerate locks through package-manager/automation paths rather than hand-editing dependency graphs.

## Blocker 1 — Observed full CI

Normal CI is configured for:

- web quality, repository/PWA policy, production build, and real-browser/offline E2E;
- locked Rust formatting/tests/Clippy;
- Android ARM64 APK/AAB compilation;
- iOS Apple-Silicon simulator compilation.

The first 2.0.14 source-bump CI attempt exposed a pre-existing rustfmt mismatch in `src-tauri/src/lib.rs`; that source was reformatted on 2026-08-25 without native behavior changes. Release readiness still requires all required jobs to be observed green on the same final 2.0.14 source commit. Configuration or committed tests are not passing evidence by themselves.

## Blocker 2 — Real-browser/PWA evidence

The production Chromium journey covers:

- onboarding;
- custom rolling;
- expression-level history analytics;
- real CSV download;
- reload persistence;
- keyboard command palette;
- exact expected value and quantile presentation;
- exact A/B comparison and accessible comparison meter;
- backup export;
- clear-data flow;
- real file-input backup restore;
- active `/sw.js` control and generated `/assets/` cache coverage;
- preview-server shutdown;
- successful offline reopen with persisted history.

The 2.0.14 UI additionally contains an exact per-total A/B distribution overlay with signed probability-point deltas and dedicated domain/component regressions. The full production journey still needs an observed successful 2.0.14 run. Representative install/Add to Home Screen behavior on desktop/ChromeOS, Android browsers, and iOS/iPadOS remains separate manual evidence.

## Blocker 3 — Parser fuzz campaign

The cargo-fuzz parser harness and bounded workflow exist. Run/observe a 2.0.14 candidate campaign and convert any reproducible crash/invariant failure into a deterministic regression before release.

## Blocker 4 — Benchmark record

Run `npm run bench` on the final candidate and record:

- exact source commit;
- hardware;
- operating system;
- Node/npm versions;
- complete benchmark output.

Do not use benchmark results from an earlier candidate as 2.0.14 evidence.

## Blocker 5 — Desktop builds and smoke

Build and smoke Windows, macOS, and Linux from the final candidate. Verify at minimum:

- launch and version `2.0.14`;
- secure and seeded rolling;
- local persistence and English/Hindi switching;
- expression history analytics and probability comparison/overlay surfaces;
- native CSV/JSON/backup/preset-file save flows;
- save-dialog cancellation behavior;
- backup restore and duplicate-safe shared preset import;
- reduced-motion/keyboard behavior;
- user-safe native errors without private path disclosure;
- Tauri runtimes remain outside browser service-worker control.

## Blocker 6 — Android physical-device evidence

On representative physical Android hardware verify:

- launch/version/secure+seeded roll paths;
- history/settings/locale persistence;
- portrait/landscape/safe-area/touch-target behavior;
- history analytics and probability comparison/overlay UI;
- CSV/JSON/backup/preset export through the system document picker;
- `content://` destination handling and cancellation;
- generic localized write failures without leaking private URIs;
- native Tauri runtime does not register `/sw.js`.

Separately test the browser/PWA install/offline path on a compatible Android browser.

## Blocker 7 — iPhone/iPad physical-device evidence

On representative iPhone and iPad hardware verify:

- launch/version/secure+seeded roll paths;
- local persistence and English/Hindi switching;
- portrait/landscape/safe-area behavior;
- history analytics and probability comparison/overlay UI;
- Files-picker CSV/JSON/backup/preset exports;
- cancellation and security-scoped access release;
- user-safe failure feedback;
- native Tauri runtime does not register `/sw.js`.

Separately test iOS/iPadOS Add to Home Screen/offline behavior for the browser target.

## Blocker 8 — Accessibility and localization review

Automated tests do not replace candidate review. Check representative desktop/mobile/PWA layouts for:

- keyboard-only primary journey;
- touch primary journey;
- focus visibility/order;
- modal focus management;
- 200% text scaling;
- safe areas;
- reduced motion;
- screen-reader labels/landmarks;
- English and Hindi layout;
- the accessible A/B comparison meter and per-total distribution overlay;
- expression analytics truncation/reading order.

## Blocker 9 — Security/repository evidence

Observe successful candidate runs/reviews for:

- secret scanning;
- CodeQL/code scanning;
- dependency alerts/audits;
- capability/CSP/offline-network/runtime/native-command/PWA policies;
- version and lock consistency;
- documentation link/anchor validation;
- exhaustive tracked-file inventory;
- repository security settings and release workflow permissions.

Confirm no broad renderer filesystem/shell/HTTP/process access was introduced and the PWA cache remains same-origin/local.

## Blocker 10 — Real candidate screenshots

Capture screenshots from verified 2.0.14 builds rather than mock/development-only states. Minimum recommended set:

- Dice Studio;
- History with expression analytics;
- Probability with A/B aggregate comparison and per-total overlay;
- Settings showing 2.0.14;
- representative Hindi interface;
- installed/standalone PWA;
- Android phone;
- iPhone;
- iPad/tablet.

## Blocker 11 — Signing/notarization/store status

Accurately record actual Windows/macOS signing status and Android/iOS distribution readiness. The current Android and unsigned iOS workflow artifacts are release-validation outputs, not automatically Play Store/App Store-ready packages.

Never commit Android keystores, Apple private certificates/keys, provisioning secrets, store API credentials, or equivalent signing material.

## Blocker 12 — Draft artifact/checksum/provenance review

Before publishing `v2.0.14`:

- download web/Windows/macOS/Linux/Android/iOS artifact packages;
- verify SHA-256 checksums;
- inspect expected package contents;
- verify the web package includes manifest/service worker/icons/generated assets;
- verify `RELEASE-METADATA.json` reports `v2.0.14` and the exact source commit/workflow identity;
- confirm Android/iOS artifact labels accurately state signing/archive status;
- confirm release notes match `CHANGELOG.md`;
- confirm signing claims match reality.

## New 2.0.14 source work already implemented

The 2.0.14 candidate adds to the carried-forward 2.0.13 implementation:

- exact linear-time alignment of two probability distributions over their union of totals;
- per-total A/B normalized bars and signed probability-point deltas;
- English/Hindi typed overlay copy and accessible comparison description;
- bounded responsive overlay rendering;
- domain/component regressions for identical, overlapping, shifted, localized, accessible, and bar-proportion cases;
- restored reusable documentation-link audit exports and portable Unicode heading slug handling after CI exposed the stale audit contract;
- synchronized exhaustive file-reference entries for all new overlay source/test/style/localization files;
- package/frontend/Cargo/Tauri source metadata bumped to 2.0.14;
- generated npm/Cargo lock application metadata synchronized to 2.0.14 by the lockfile workflow;
- current-stable rustfmt applied to the native source after the first 2.0.14 CI formatting gate exposed drift.

Carried forward from the unpublished 2.0.13 candidate:

- expression-level history aggregation by normalized expression with count/share/average/range/latest activity;
- responsive History expression analytics panel;
- accessible stacked pairwise probability comparison meter;
- duplicate-safe/idempotent shared preset imports based on normalized content;
- domain/component/integration regressions for those behaviors;
- real-browser E2E assertions for history analytics and exact aggregate comparison visualization.

These are source/configuration changes, not substitutes for the execution evidence above.

## Final publication gate

Publish `v2.0.14` only after the final candidate evidence is complete enough for a maintainer to choose **APPROVE** in a filled copy of [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md).

## Handoff references

- [`../what_changed.md`](../what_changed.md)
- [`web-pwa.md`](web-pwa.md)
- [`handoffs/README.md`](handoffs/README.md)
- [`lockfile-policy.md`](lockfile-policy.md)
- [`release.md`](release.md)
- [`testing.md`](testing.md)
- [`../ROADMAP.md`](../ROADMAP.md)