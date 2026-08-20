# DiceLab Release Candidate Evidence Template

Copy this file into a versioned release-evidence record when preparing a real candidate. Do not mark an item complete unless the evidence was actually observed for the exact candidate commit/artifact.

For the current release-preparation cycle, the expected identity is version `2.0.12` / tag `v2.0.12`. If this template is reused later, replace those values with the actual candidate rather than carrying them forward blindly.

## Candidate identity

- Version: 2.0.12
- Tag: v2.0.12
- Source commit:
- Candidate date:
- Reviewer(s):
- GitHub Actions run URL/ID:
- Release draft URL/ID:
- Production web/PWA deployment URL used for install/offline evidence:

## Version, dependency, and source integrity

- [ ] `package.json` reports the candidate version.
- [ ] Top-level `package-lock.json` version reports the candidate version.
- [ ] `package-lock.json` root `packages[""]` version reports the candidate version.
- [ ] `src/config/app.ts` reports the candidate version.
- [ ] `src-tauri/Cargo.toml` reports the candidate version.
- [ ] The `dicelab` package entry in `src-tauri/Cargo.lock` reports the candidate version.
- [ ] `src-tauri/tauri.conf.json` reports the candidate version.
- [ ] `DICELAB_EXPECT_VERSION=v2.0.12 npm run version:check` completed successfully for this candidate.
- [ ] `package-lock.json` matches `package.json` dependency metadata.
- [ ] `src-tauri/Cargo.lock` matches `src-tauri/Cargo.toml` and contains every direct crate, including `tauri-plugin-dialog` and `tauri-plugin-fs` when declared.
- [ ] `npm run policy:lockfiles` completed successfully.
- [ ] `npm ci` completed from a clean checkout.
- [ ] `cargo test --locked` completed from the candidate commit.
- [ ] `cargo clippy --all-targets --all-features --locked -- -D warnings` completed.
- [ ] Repository secret audit completed without exposing matched secret values.
- [ ] Dependency/security alerts reviewed.
- [ ] CodeQL/security scanning reviewed.

Evidence:

```text
Paste command/run identifiers and concise results here. Do not paste secrets.
```

## Cross-platform configuration identity

- [ ] Windows native target remains configured.
- [ ] macOS native target remains configured.
- [ ] Linux native target remains configured.
- [ ] Android minimum is Android API 24 or the intentionally reviewed replacement.
- [ ] iOS/iPadOS minimum is iOS 14.0 or the intentionally reviewed replacement.
- [ ] Main Tauri capability explicitly covers Linux/macOS/Windows/Android/iOS.
- [ ] Main renderer capability remains narrow and does not grant broad `fs:`, `shell:`, `http:`, or `process:` families.
- [ ] Android init/dev/build npm commands resolve through the locked Tauri CLI.
- [ ] iOS init/dev/build/simulator/archive npm commands resolve through the locked Tauri CLI on macOS.
- [ ] `src/mobile.css` is loaded after shared styling and safe-area/touch rules remain active.
- [ ] Production web target exposes the reviewed `manifest.webmanifest` and `/sw.js` files.
- [ ] Standard 192×192 and 512×512 PNG install icons remain declared; the 512×512 icon remains maskable.
- [ ] The 180×180 Apple touch icon remains linked from `index.html`.
- [ ] `viewport-fit=cover` remains present for edge-to-edge/safe-area browser layouts.
- [ ] Service-worker registration remains production-only, excludes Tauri, and requires HTTPS or reviewed loopback HTTP.

Evidence:

```text
```

## Repository and documentation policy boundaries

- [ ] `npm run docs:check:test` passed.
- [ ] `npm run docs:check` passed.
- [ ] `npm run docs:inventory:test` passed.
- [ ] `npm run docs:inventory` passed.
- [ ] Native capability policy self-tests passed.
- [ ] Actual committed capability audit passed.
- [ ] Tauri CSP/IPC policy self-tests passed.
- [ ] Actual committed Tauri security configuration audit passed.
- [ ] Offline CSP/network-source audit passed.
- [ ] Localized-formatting boundary audit passed.
- [ ] Native runtime service-boundary audit passed.
- [ ] Native command-contract audit passed.
- [ ] PWA auditor self-test passed.
- [ ] PWA integrity audit passed, including generated Vite `/assets/` precaching and Tauri exclusion.
- [ ] Aggregate `npm run policy:test` passed.
- [ ] Aggregate `npm run policy:all` passed.
- [ ] Release verifier self-test passed.

Evidence:

```text
Record workflow names/run IDs or local command output summaries.
```

## Normal CI evidence

- [ ] Web quality job green on the exact candidate commit.
- [ ] Web job's PWA policy checks are green on the exact candidate commit.
- [ ] Web job's production browser/PWA offline-reopen E2E is green on the exact candidate commit.
- [ ] Locked Rust quality job green on the exact candidate commit.
- [ ] Android ARM64 build job green on the exact candidate commit.
- [ ] iOS Apple-Silicon simulator build job green on the exact candidate commit.
- [ ] Focused repository-policy workflow green for the candidate policy surface.
- [ ] Dependency-free repository-audit workflow green for the candidate commit.
- [ ] Any rerun/retry was reviewed and did not change source identity.

Evidence:

```text
Record exact workflow run/job identifiers.
```

## Frontend quality

- [ ] `npm run format`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run test:e2e:infra`
- [ ] `npm run policy:pwa:test`
- [ ] `npm run policy:pwa`
- [ ] `npm run test:e2e` in an unrestricted Chromium-compatible environment

Evidence:

```text
Record exact runtime versions and run identifiers.
```

## Web / PWA candidate

Deployment identity:

- URL:
- Protocol:
- Hosting/build identifier:
- Browser(s) and version(s):

Automated production PWA evidence:

- [ ] DiceLab is controlled by the expected `/sw.js` service worker during the production E2E journey.
- [ ] A versioned `dicelab-*` cache is created.
- [ ] The DiceLab cache contains generated Vite `/assets/` runtime files.
- [ ] The preview server is stopped before the automated offline reload.
- [ ] A cache-bypassing reload succeeds while the preview server is unavailable.
- [ ] DiceLab content renders after the offline reopen.
- [ ] Previously restored/created roll history remains available after the offline reopen.

Install metadata/artifact evidence:

- [ ] `manifest.webmanifest` loads without parse errors.
- [ ] `start_url` and `scope` match the reviewed root deployment model.
- [ ] 192×192 install icon renders correctly.
- [ ] 512×512 maskable install icon renders correctly.
- [ ] Apple touch icon renders correctly.
- [ ] Web release artifact contains `manifest.webmanifest`, `sw.js`, install icons, and generated `/assets/` files.
- [ ] Normal non-loopback production service-worker registration uses HTTPS.

Representative real install/offline evidence:

- [ ] Desktop browser or ChromeOS install/standalone launch reviewed where supported.
- [ ] Android browser install/add-to-home-screen flow reviewed where supported.
- [ ] iOS/iPadOS Add to Home Screen title/icon behavior reviewed.
- [ ] Representative installed/standalone browser layout reviewed.
- [ ] Representative real browser/device offline reopen reviewed after an initial successful online load.
- [ ] Local history/settings/locale persistence remains intact offline.
- [ ] Browser download/export behavior remains usable where permitted by the browser.
- [ ] Reconnecting refreshes runtime assets without corrupting local application data.
- [ ] Tauri desktop, Android, and iOS builds do not register or become controlled by `/sw.js`.

Evidence/notes:

```text
Record browser/device versions, install method, deployment identity, and offline observations.
```

## Parser fuzzing

- [ ] Bounded parser fuzz campaign completed on the candidate commit.
- [ ] No crash/invariant artifacts were produced, or every finding has a deterministic regression and fix.

Campaign details:

- Rust toolchain:
- cargo-fuzz version:
- Duration:
- Seed/corpus notes:
- Workflow/run ID:

## Benchmark evidence

- Hardware:
- Operating system:
- Node version:
- npm version:
- Rust version:
- Commit:

```text
Paste the complete benchmark output or link to the preserved run artifact.
```

Do not compare benchmark values without recording the machine/runtime context.

## Windows candidate

Artifact/checksum:

- [ ] Checksum matches `SHA256SUMS.txt`.
- [ ] Installs/launches successfully.
- [ ] About/Settings reports the candidate version.
- [ ] Secure roll works.
- [ ] Seeded reference roll matches the web companion.
- [ ] Settings persist after restart.
- [ ] English/Hindi switching works after restart.
- [ ] Localized built-ins update without rewriting user-created content.
- [ ] Roll/history/probability presentation follows the selected locale.
- [ ] History CSV native save dialog works.
- [ ] History JSON native save dialog works.
- [ ] Backup native save dialog works.
- [ ] Native save-dialog cancellation creates no file and no failure state.
- [ ] Backup restore works from the exported candidate file.
- [ ] Reduced-motion behavior reviewed.
- [ ] Keyboard navigation reviewed.
- [ ] Contact/project details reviewed.
- [ ] No private path/raw OS error is exposed by native export failure UI.
- [ ] Native Tauri runtime is not controlled by the browser service worker.

Evidence/notes:

```text
```

## macOS candidate

Artifact/checksum:

- [ ] Checksum matches `SHA256SUMS.txt`.
- [ ] Installs/launches successfully.
- [ ] About/Settings reports the candidate version.
- [ ] Secure roll works.
- [ ] Seeded reference roll matches the web companion.
- [ ] Settings persist after restart.
- [ ] English/Hindi switching works after restart.
- [ ] Localized built-ins update without rewriting user-created content.
- [ ] Roll/history/probability presentation follows the selected locale.
- [ ] History CSV native save dialog works.
- [ ] History JSON native save dialog works.
- [ ] Backup native save dialog works.
- [ ] Native save-dialog cancellation creates no file and no failure state.
- [ ] Backup restore works from the exported candidate file.
- [ ] Reduced-motion behavior reviewed.
- [ ] Keyboard navigation reviewed.
- [ ] Contact/project details reviewed.
- [ ] No private path/raw OS error is exposed by native export failure UI.
- [ ] Native Tauri runtime is not controlled by the browser service worker.

Signing/notarization status:

```text
State exactly what was performed. Do not call an unsigned/unnotarized artifact signed/notarized.
```

Evidence/notes:

```text
```

## Linux candidate

Artifact/checksum:

- [ ] Checksum matches `SHA256SUMS.txt`.
- [ ] Installs/launches successfully.
- [ ] About/Settings reports the candidate version.
- [ ] Secure roll works.
- [ ] Seeded reference roll matches the web companion.
- [ ] Settings persist after restart.
- [ ] English/Hindi switching works after restart.
- [ ] Localized built-ins update without rewriting user-created content.
- [ ] Roll/history/probability presentation follows the selected locale.
- [ ] History CSV native save dialog works.
- [ ] History JSON native save dialog works.
- [ ] Backup native save dialog works.
- [ ] Native save-dialog cancellation creates no file and no failure state.
- [ ] Backup restore works from the exported candidate file.
- [ ] Reduced-motion behavior reviewed.
- [ ] Keyboard navigation reviewed.
- [ ] Contact/project details reviewed.
- [ ] No private path/raw OS error is exposed by native export failure UI.
- [ ] Native Tauri runtime is not controlled by the browser service worker.

Evidence/notes:

```text
```

## Android candidate

Build artifact/checksum:

- [ ] Tagged workflow produced expected APK output.
- [ ] Tagged workflow produced expected AAB output.
- [ ] Artifact package checksum matches `SHA256SUMS.txt`.
- [ ] Artifact is labeled with its actual signing/validation state.

Physical-device evidence:

- Device model:
- Android version/API level:
- CPU/ABI:
- Document provider(s) tested:

- [ ] Installs/launches successfully on a supported physical device.
- [ ] About/Settings reports the candidate version.
- [ ] Secure roll works.
- [ ] Seeded reference roll matches the web companion.
- [ ] History/settings/presets persist across restart.
- [ ] English/Hindi selection persists across restart.
- [ ] Portrait layout reviewed.
- [ ] Landscape layout reviewed.
- [ ] Safe-area/system-inset behavior reviewed.
- [ ] Coarse-pointer/touch targets are usable.
- [ ] History CSV export works through the Android document picker.
- [ ] History JSON export works through the Android document picker.
- [ ] Backup export works through the Android document picker.
- [ ] At least one successful `content://` provider-backed save was observed.
- [ ] Native picker cancellation creates no false failure state.
- [ ] Backup restore works from a candidate-produced file.
- [ ] A provider/write failure produces localized safe feedback.
- [ ] No private content URI/raw provider error is exposed by UI/logging.
- [ ] Native Tauri runtime does not register `/sw.js`.
- [ ] Android production signing/Google Play status is stated accurately.

Signing/Play status:

```text
State unsigned/signed, keystore handling, and Play Console status without including secrets.
```

Evidence/notes:

```text
```

## iPhone candidate

Build artifact/checksum:

- [ ] Normal CI simulator build succeeded for the candidate source.
- [ ] Tagged release workflow produced the expected unsigned ARM64 device archive.
- [ ] Archive package checksum matches `SHA256SUMS.txt`.
- [ ] Archive is labeled as unsigned/archive validation unless a separate reviewed signing path was completed.

Physical-device evidence:

- Device model:
- iOS version:

- [ ] Launches successfully on a supported physical iPhone through the reviewed development/distribution path.
- [ ] About/Settings reports the candidate version.
- [ ] Secure roll works.
- [ ] Seeded reference roll matches the web companion.
- [ ] History/settings/presets persist across restart.
- [ ] English/Hindi selection persists across restart.
- [ ] Portrait/landscape behavior reviewed.
- [ ] Notch/Dynamic-Island/home-indicator safe areas reviewed where applicable.
- [ ] Touch targets are usable.
- [ ] History CSV export works through the Files picker.
- [ ] History JSON export works through the Files picker.
- [ ] Backup export works through the Files picker.
- [ ] Picker cancellation creates no false failure state.
- [ ] Backup restore works from a candidate-produced file.
- [ ] App remains usable after returning from the picker/security-scoped access lifecycle.
- [ ] Native export failure UI does not expose a private selected file/raw native error.
- [ ] Native Tauri runtime does not register `/sw.js`.
- [ ] Apple signing/App Store Connect status is stated accurately.

Signing/App Store status:

```text
State simulator/unsigned archive/development-signed/distribution-signed status exactly. Do not include credentials.
```

Evidence/notes:

```text
```

## iPad candidate

- Device model:
- iPadOS version:

- [ ] Launches successfully on a supported iPad.
- [ ] Tablet layout uses available space without hidden required controls.
- [ ] Portrait and landscape orientations reviewed.
- [ ] Safe-area behavior reviewed.
- [ ] 200% text scaling/accessibility sizing reviewed where supported.
- [ ] English/Hindi layout reviewed.
- [ ] History CSV/JSON export works through the Files picker.
- [ ] Backup export/restore works.
- [ ] Picker cancellation/failure behavior is safe.
- [ ] Settings/history persist after restart.
- [ ] Native Tauri runtime does not register `/sw.js`.

Evidence/notes:

```text
```

## Accessibility review

- [ ] Desktop primary journey completed with keyboard only.
- [ ] Focus is visible and logical.
- [ ] Command palette traps/restores focus correctly.
- [ ] Onboarding is usable by keyboard.
- [ ] Android/iOS touch primary journey completed.
- [ ] Installed/standalone PWA primary layout reviewed on a representative platform.
- [ ] 200% text scaling does not hide required controls/content on representative targets.
- [ ] Reduced-motion preference removes nonessential movement.
- [ ] Screen-reader names identify primary controls and dialogs on representative desktop/mobile/browser targets.
- [ ] Mobile safe areas/notches/home indicators do not cover controls.
- [ ] English layout reviewed.
- [ ] Hindi layout reviewed.

Reviewer/platform/tool notes:

```text
```

## Real screenshots

Only candidate-build screenshots belong here.

- [ ] Dice Studio screenshot captured.
- [ ] History screenshot captured.
- [ ] Probability screenshot captured.
- [ ] Settings screenshot captured showing the candidate version.
- [ ] Hindi interface screenshot captured.
- [ ] Installed/standalone PWA or ChromeOS screenshot captured.
- [ ] Android phone screenshot captured.
- [ ] iPhone screenshot captured.
- [ ] iPad/tablet screenshot captured.

Paths/links:

```text
```

## Release packaging and provenance

- [ ] Tag workflow's documentation and repository-policy gates completed successfully.
- [ ] Expected Windows/macOS/Linux/web artifacts are present.
- [ ] Web artifact contains `manifest.webmanifest`, `sw.js`, required install icons, and generated `/assets/` runtime files.
- [ ] Expected Android APK/AAB validation artifact package is present.
- [ ] Expected unsigned iOS device archive package is present.
- [ ] ZIP files are non-empty and inspect correctly.
- [ ] `RELEASE-METADATA.json` identifies the expected repository/tag/source commit/workflow run.
- [ ] For the current candidate, `RELEASE-METADATA.json` reports tag `v2.0.12`.
- [ ] `SHA256SUMS.txt` covers packaged artifact ZIPs and provenance metadata.
- [ ] Every published checksum was independently verified after download.
- [ ] Generated release notes were reviewed against `CHANGELOG.md`.
- [ ] Desktop signing/notarization claims exactly match produced artifacts.
- [ ] Android signing/Play claims exactly match produced artifacts/account state.
- [ ] iOS signing/App Store claims exactly match produced artifacts/account state.
- [ ] Unsigned validation artifacts are not described as store-ready.
- [ ] PWA install/offline claims match observed candidate deployment evidence rather than source configuration alone.

Evidence:

```text
```

## Final decision

- [ ] No release blocker remains.
- [ ] All unchecked items are explicitly documented as non-blocking with rationale.
- [ ] `CHANGELOG.md` matches shipped behavior and candidate status.
- [ ] `ROADMAP.md` reflects completed evidence.
- [ ] `what_changed.md` reflects the final candidate state.
- [ ] Draft release was reviewed before publication.

Decision:

```text
APPROVE / HOLD
```

Reviewer rationale:

```text
```
