# DiceLab Post-Documentation Correctness Audit — 2026-08-19

This handoff records defects discovered by cross-checking the newly completed deep documentation against the current implementation and repository policy scripts.

Previous handoff:

- [`2026-08-19-documentation-completion.md`](2026-08-19-documentation-completion.md)

Current entry point:

- [`../../what_changed.md`](../../what_changed.md)

## Why this audit exists

The deep documentation pass documented actual data/control/security boundaries rather than only file names. Comparing those written invariants with implementation code exposed several real mismatches. This handoff preserves the fixes separately so later work does not assume documentation completion meant the implementation had no remaining correctness issues.

## Fixed: exported backups could exceed DiceLab's own restore limit

### Previous behavior

`parseBackupJson()` rejected backup input larger than 5,000,000 UTF-8 bytes, but `backupToJson()` did not enforce the same limit before export.

Consequences:

- the browser companion could produce a JSON backup that DiceLab itself would immediately reject on restore;
- the native path had a separate generic 6,000,000-byte text-export transport limit, so browser and native behavior could diverge for large backups;
- the product could not guarantee that a successfully generated backup was within its own documented restore size contract.

### Fix

`src/services/export.ts` now centralizes the 5,000,000-byte backup size check in `assertBackupSize()` using `TextEncoder` UTF-8 byte length.

The check is applied to both:

- `backupToJson()` before a backup can be saved/downloaded;
- `parseBackupJson()` before parsing restored backup input.

An oversized export throws the existing stable:

```text
BackupValidationError
code = backup-too-large
context.limit = 5_000_000
```

No silent truncation is performed.

### Localized export failure

`SettingsPanel` now passes backup-export failures through `formatBackupError()` rather than treating every export failure as unknown. Therefore the known size failure renders the existing localized 5 MB message in English/Hindi while unknown native/browser failures remain generic and do not expose raw details.

### Regression coverage

Updated:

- `src/services/backup.test.ts`
- `src/components/SettingsPanel.backup.localization.test.tsx`

Coverage includes:

- refusing to serialize an oversized backup;
- stable `backup-too-large` code/context;
- Hindi oversized-export feedback;
- no private/developer serialization detail rendered to the user.

Relevant commits:

- `3595652f` — `fix: keep exported backups within restore size limit`
- `c57a2dc0` — `fix: show localized backup export size errors`
- `b4d3fa1c` — `test: reject backups too large to restore before export`
- `825ab06e` — `test: localize oversized backup export feedback`

## Fixed: live locale switching could leave shell navigation in the old language

### Root cause

`src/components/AppShell.tsx` previously created a module-level navigation array whose `label` strings were read from `messages.navigation.*` once when the JavaScript module evaluated.

`setLocale()` changes the live exported `messages` binding, but already-created primitive string values do not become live bindings themselves.

This meant a Settings language change could rerender the application while shell navigation continued displaying labels captured from the old locale.

### Fix

The navigation item array is now created inside `AppShell` render so it reads the current catalog every render.

The shell's brand accessible name also no longer appends a hardcoded English `home` word; it uses the locale-neutral product name.

Relevant commits:

- `c506ff79` — `fix: refresh navigation labels after locale changes`
- `f4850483` — `fix: remove hardcoded English from brand accessible name`

## Fixed: command palette labels could remain in the old language

### Root cause

`src/components/CommandPalette.tsx` had the same module-evaluation problem: a module-level command array captured translated labels/details once.

### Fix

Command definitions are now produced by `getCommands()` during component rendering. Search/filter results therefore use the current active catalog after a live locale change.

Relevant commit:

- `0dd6fcef` — `fix: refresh command labels after locale changes`

### Regression coverage

`src/App.localization.integration.test.tsx` now verifies one live English → Hindi switch changes:

- persistent shell Roll label;
- persistent shell History label;
- command palette dialog heading;
- command palette roll command;
- command palette probability command;
- built-in preset copy;
- document `lang` metadata;

while preserving user-created preset name/description exactly.

The dialog assertion uses its semantic accessible heading rather than a fragile singular text query because the same translated phrase can legitimately appear in more than one surface.

Relevant commits:

- `e38f4864` — `test: cover live shell and command palette localization`
- `269c7261` — `test: target localized command dialog semantically`

## Localization contributor rule added

`docs/localization.md` now explicitly prohibits module-level capture of translated string values when they must update during a live locale switch.

Catalog-backed navigation/menu/command/accessibility values should be created during render or from a render-time function. Technical non-localized constants may remain module-level.

Live-switch regression review now explicitly includes persistent shell/navigation/menu/dialog copy, not only the currently selected content panel.

Relevant commit:

- `12a2b904` — `docs: prevent stale module captured locale strings`

## Fixed: Tauri security audit rejected legitimate Vite development loopback origin

### Previous policy bug

`src-tauri/tauri.conf.json` correctly configures a development CSP for the local Vite/Tauri development server, including explicit loopback sources such as:

```text
http://localhost:1420
ws://localhost:1421
```

The repository's Tauri security audit originally applied the production remote-origin rule to `devCsp` without a development distinction. Because `default-src` can be used as script fallback, the integration audit could report the legitimate local development server as a remote script source.

### Fix

`scripts/check-tauri-security.mjs` now keeps production CSP strict while allowing explicit HTTP/HTTPS loopback origins only while auditing `devCsp`.

Recognized development loopback hosts:

```text
localhost
127.0.0.1
[::1]
```

The exception does not permit:

- non-loopback development hosts;
- wildcard sources;
- `unsafe-eval`;
- remote-domain IPC;
- a localhost development origin in the packaged production CSP.

Tests now prove loopback development source acceptance plus production/non-loopback rejection.

Relevant commits:

- `d6739ff4` — `fix: allow loopback development origins in Tauri CSP audit`
- `20b81e25` — `test: distinguish dev loopback from remote Tauri origins`

## Fixed: offline CSP audit rejected legitimate local dev server/HMR

### Previous policy bug

The offline-network auditor scanned every CSP directive but also treated `devCsp` as if it were the packaged production policy. This incorrectly rejected explicit loopback HTTP/WS Vite/HMR sources.

### Fix

`scripts/check-offline-csp.mjs` now has a development-only explicit loopback exception.

Production behavior remains strict:

- explicit `http://localhost...` remains rejected in production CSP;
- scheme-wide `http:` / `https:` / `ws:` / `wss:` remain rejected everywhere;
- non-loopback development origins remain rejected;
- Tauri local asset/IPC mechanisms remain permitted.

Development `devCsp` may use explicit loopback HTTP/HTTPS/WS/WSS URLs required by Vite/Tauri development.

Tests cover:

- localhost, `127.0.0.1`, and `[::1]` loopback URLs in dev;
- production rejection of the same loopback source;
- scheme-wide source rejection even with development loopback enabled;
- non-loopback development rejection.

Relevant commits:

- `98c64a74` — `fix: allow loopback development sources in offline CSP audit`
- `f8b72bb2` — `test: distinguish dev loopback from production network sources`

## CSP policy documentation corrected

Updated:

- `docs/tauri-security-policy.md`
- `docs/offline-network-policy.md`

The docs now distinguish:

- packaged production offline/CSP policy;
- Tauri internal local IPC/asset endpoints;
- explicit loopback-only Vite/HMR development sources;
- forbidden broad network schemes/non-loopback remote origins.

Relevant commits:

- `430d920f` — `docs: document loopback only development CSP exception`
- `e55ad9cc` — `docs: document development loopback network exception`

## Release evidence remains separate

These fixes update source, tests, policies, and documentation. They do not prove the corresponding GitHub workflows have run successfully on the intended release candidate.

The first known release blocker remains the stale Rust dependency lockfile until a generated `src-tauri/Cargo.lock` containing `tauri-plugin-dialog` is committed and locked Rust tests/Clippy are observed.

After that, release evidence must still include repository audits, frontend/browser tests, fuzzing, benchmarks, platform-native save/localization/accessibility smoke, security review, screenshots, checksums/provenance, and draft-release review.
