# DiceLab Policy Hardening Handoff — 2026-08-19

This handoff records the continuation work completed after the current `what_changed.md` refresh and the archived pre-native-export handoff.

Related handoff history:

- [`../../what_changed.md`](../../what_changed.md)
- [`2026-08-19-pre-native-exports.md`](2026-08-19-pre-native-exports.md)

## Scope of this continuation wave

This wave focused on turning architecture, localization, native-security, and release-governance rules into executable repository policies while adding cross-layer localization lifecycle tests and GitHub collaboration metadata.

No evidence-gated release item is marked complete merely because a workflow or test file now exists.

## Cross-layer localization regressions

Added integration/component coverage for lifecycle and failure paths that were not fully represented in the earlier handoff.

### User-created preset preservation during live switching

`src/App.localization.integration.test.tsx`

Verifies that switching English → Hindi:

- localizes built-in preset copy;
- preserves a user-created preset name exactly;
- preserves a user-created preset description exactly;
- updates the document language to `hi`.

Commit message:

- `test: preserve user presets across live locale switching`

### Persisted locale on first application render

`src/App.locale-startup.integration.test.tsx`

Verifies that a locally persisted Hindi preference is applied on the initial application render rather than only after opening Settings.

Commit message:

- `test: apply persisted locale during initial render`

### Backup restore switches the live locale

`src/App.locale-backup.integration.test.tsx`

Verifies that importing a schema-v1 backup whose settings specify Hindi:

- switches the live application to Hindi;
- updates document language metadata;
- localizes built-in presets;
- preserves restored user-created preset copy.

Commit message:

- `test: restore Hindi locale through backup import`

### Clear-data resets locale/default onboarding

`src/App.locale-clear.integration.test.tsx`

Verifies that confirmed local-data clearing from a Hindi session:

- returns settings to English defaults;
- restores English onboarding;
- restores document language metadata to `en`.

Commit message:

- `test: reset locale when clearing local data`

### First-run onboarding respects persisted locale

`src/App.locale-onboarding.integration.test.tsx`

Verifies that an uncompleted first-run experience uses the persisted Hindi catalog immediately.

Commit message:

- `test: localize first run onboarding from persisted locale`

### Localized parser validation

`src/components/RollWorkspace.validation.localization.test.tsx`

Verifies that invalid dice notation produces the Hindi corrective parser message and keeps Roll disabled.

Commit message:

- `test: localize dice validation feedback in Hindi`

### Localized backup failures

`src/components/SettingsPanel.backup.localization.test.tsx`

Verifies:

- known oversized-backup errors use the safe Hindi catalog message;
- unknown export failures use generic Hindi status;
- developer/native details are not exposed in rendered status text.

Commit message:

- `test: localize backup failures in Hindi`

### Localized history export status

`src/components/HistoryPanel.export.localization.test.tsx`

Verifies successful and failed browser export feedback in Hindi and confirms raw browser exception details are not rendered.

Commit message:

- `test: localize history export feedback in Hindi`

## Desktop capability policy

Added a dependency-free policy boundary around `src-tauri/capabilities/*.json`.

Files:

- `scripts/check-capabilities.mjs`
- `scripts/check-capabilities.test.mjs`
- `scripts/check-capabilities.integration.test.mjs`
- `.github/workflows/capability-audit.yml`
- `docs/capability-policy.md`

The audit rejects:

- remote-origin capability blocks;
- missing explicit window targets;
- wildcard window targets;
- malformed permission entries;
- `fs:` permissions;
- `shell:` permissions;
- `http:` permissions;
- `process:` permissions.

The committed capability directory has an integration regression in addition to synthetic policy tests.

Relevant commit messages:

- `security: add desktop capability policy audit`
- `test: cover desktop capability policy audit`
- `test: audit committed desktop capability file`
- `ci: add desktop capability policy gate`
- `docs: document desktop capability policy gate`

## Tauri CSP / remote-IPC policy

Added a second dependency-free audit for `src-tauri/tauri.conf.json`.

Files:

- `scripts/check-tauri-security.mjs`
- `scripts/check-tauri-security.test.mjs`
- `scripts/check-tauri-security.integration.test.mjs`
- `.github/workflows/tauri-security-audit.yml`
- `docs/tauri-security-policy.md`

The policy requires:

- an `app.security` configuration;
- a non-empty CSP;
- `default-src` containing `'self'`;
- no wildcard CSP source;
- no `'unsafe-eval'`;
- no remote HTTP/HTTPS script source;
- no `dangerousRemoteDomainIpcAccess` configuration.

If `devCsp` is added later it is audited under the same baseline.

Relevant commit messages:

- `security: add Tauri security configuration audit`
- `test: cover Tauri security configuration audit`
- `test: audit committed Tauri security configuration`
- `ci: add Tauri security configuration gate`
- `docs: document Tauri security configuration policy`

## Offline CSP network-source policy

Added a stricter offline-first network-source audit that examines every CSP directive, not only scripts.

Files:

- `scripts/check-offline-csp.mjs`
- `scripts/check-offline-csp.test.mjs`
- `scripts/check-offline-csp.integration.test.mjs`
- `.github/workflows/offline-csp-audit.yml`
- `docs/offline-network-policy.md`

Allowed local runtime mechanisms include the local Tauri asset/IPC endpoints and non-network local schemes currently required by the application.

The audit rejects remote/network CSP sources including:

- `http:`
- `https:`
- `ws:`
- `wss:`
- remote HTTP/HTTPS/WebSocket origins.

Relevant commit messages:

- `security: add offline CSP network-source audit`
- `test: cover offline CSP network-source audit`
- `test: audit committed offline CSP policy`
- `ci: enforce offline CSP network policy`
- `docs: document offline CSP network policy`

## Localized formatting boundary policy

Added a dependency-free repository audit that prevents localized React surfaces from bypassing the shared formatter boundary.

Files:

- `scripts/check-localized-formatting.mjs`
- `scripts/check-localized-formatting.test.mjs`
- `scripts/check-localized-formatting.integration.test.mjs`
- `.github/workflows/localized-formatting-audit.yml`

Production `src/App.tsx` and component sources are rejected when they directly use:

- `.toLocaleString()`
- `.toLocaleDateString()`
- `.toLocaleTimeString()`
- `new Intl.NumberFormat()`
- `new Intl.DateTimeFormat()`

Locale-sensitive UI values should use `src/i18n/format.ts` instead.

Relevant commit messages:

- `quality: add localized formatting boundary audit`
- `test: cover localized formatting boundary audit`
- `test: audit committed localized UI formatting`
- `ci: enforce localized formatting boundary`

## Native runtime service boundary

Added an executable policy that keeps renderer/native runtime details behind approved services.

Files:

- `scripts/check-runtime-boundaries.mjs`
- `scripts/check-runtime-boundaries.test.mjs`
- `scripts/check-runtime-boundaries.integration.test.mjs`
- `.github/workflows/runtime-boundary-audit.yml`
- `docs/runtime-boundary-policy.md`

Current rules:

- `@tauri-apps/api/core` production access is limited to `src/services/roll-service.ts` and `src/services/export.ts`;
- `__TAURI_INTERNALS__` runtime probing is limited to `src/services/runtime.ts`;
- tests may mock native boundaries intentionally.

Relevant commit messages:

- `architecture: add native runtime boundary audit`
- `test: cover native runtime boundary audit`
- `test: audit committed native runtime boundaries`
- `ci: enforce native runtime service boundary`
- `docs: document native runtime service boundary`

## Native command contract

Added a separate allowlist/synchronization audit for renderer→Rust command invocation.

Files:

- `scripts/check-native-command-contract.mjs`
- `scripts/check-native-command-contract.test.mjs`
- `scripts/check-native-command-contract.integration.test.mjs`
- `.github/workflows/native-command-contract.yml`
- `docs/native-command-contract.md`

Approved commands remain:

- `roll_expression` → invoked only by `src/services/roll-service.ts`;
- `save_text_export` → invoked only by `src/services/export.ts`.

The audit rejects:

- unknown native command names;
- dynamic/non-literal native command names;
- approved commands invoked from the wrong adapter;
- unapproved Rust handler entries;
- missing approved handler entries;
- duplicate handler entries.

Relevant commit messages:

- `architecture: add native command contract audit`
- `test: cover native command contract audit`
- `test: audit committed native command contract`
- `ci: enforce native command contract`
- `docs: document native command contract policy`

## Aggregate repository policy status

Added:

- `scripts/check-policy-boundaries.mjs`
- `scripts/check-policy-boundaries.integration.test.mjs`
- `.github/workflows/repository-policy-audit.yml`
- `.github/workflows/release-policy-audits.yml`
- `docs/repository-policy-gates.md`

The first aggregate set combines:

- desktop capability policy;
- Tauri security policy;
- localized formatting boundary;
- native runtime boundary.

Native command and offline CSP audits have dedicated workflows and version-tag coverage as documented above.

Relevant commit messages:

- `quality: add aggregate repository policy audit`
- `test: audit all committed repository policy boundaries`
- `ci: add aggregate repository policy status`
- `ci: audit repository policy boundaries on release tags`
- `docs: index repository policy gates`

## Dependency lock consistency audit

Added a dependency-free early audit for direct manifest/lock drift.

Files:

- `scripts/check-lockfile-consistency.mjs`
- `scripts/check-lockfile-consistency.test.mjs`
- `.github/workflows/release-lockfile-consistency.yml`
- `docs/lockfile-policy.md`

### npm checks

Compares direct root dependency requests in `package.json` with `package-lock.json` and reports:

- missing direct requests;
- stale direct requests;
- version/range request mismatches.

### Cargo checks

Parses direct dependencies/build dependencies/target-specific dependencies from `src-tauri/Cargo.toml`, including package aliases, and confirms each direct package exists in `src-tauri/Cargo.lock`.

The audit deliberately does not fabricate or edit transitive lock metadata.

The version-tag/manual workflow is expected to block release candidates whose committed manifest/lock state is inconsistent.

Relevant commit messages:

- `build: add dependency lock consistency audit`
- `test: cover dependency lock consistency audit`
- `ci: gate release tags on lockfile consistency`
- `docs: document dependency lockfile consistency policy`

## GitHub collaboration metadata

Added repository collaboration/support metadata:

- `.github/CODEOWNERS`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/pull_request_template.md`
- `.github/FUNDING.yml`
- `SUPPORT.md`

### CODEOWNERS

Defines `@sanskarIN` as default owner and explicitly identifies security-sensitive desktop/workflow/release metadata paths.

### Bug report form

Collects:

- version/commit;
- runtime/platform;
- minimal reproduction;
- expected behavior;
- frequency;
- optional accessibility impact;
- redacted diagnostics.

It explicitly routes security vulnerabilities away from public issue reporting and asks reporters not to include secrets/private data.

### Feature request form

Requires the user problem first and asks requesters to consider:

- offline usefulness;
- no required account/cloud dependency;
- privacy and least privilege;
- accessibility;
- cross-platform/localization compatibility.

### Issue routing

Blank issues are disabled and security, roadmap, and contributor guidance are exposed as contact links.

### Pull request template

Adds explicit review areas for:

- observed verification rather than assumed CI;
- localization;
- locale formatting;
- accessibility;
- native runtime/command boundaries;
- capabilities/CSP;
- privacy/logging;
- generated lockfiles;
- release documentation/evidence.

### Funding/support

Adds optional funding metadata while preserving the product rule that features are not donation-gated. `SUPPORT.md` documents public issue guidance, private security reporting, privacy-safe diagnostics, and support contacts.

Representative commit messages:

- `chore: define repository code ownership`
- `docs: add structured DiceLab bug report form`
- `docs: add structured DiceLab feature request form`
- `docs: add DiceLab pull request review checklist`
- `docs: route public issues through structured forms`
- `chore: add optional project funding metadata`
- `docs: add DiceLab support guidance`

## Release evidence template

Added:

- `docs/release-candidate-evidence-template.md`

The template records:

- candidate/tag/source identity;
- dependency/lock integrity;
- repository policy evidence;
- frontend/browser quality;
- parser fuzz evidence;
- benchmark environment/output;
- Windows/macOS/Linux candidate smoke matrices;
- localization/accessibility review;
- native export save/cancel/failure behavior;
- real candidate screenshots;
- artifact checksums/provenance/signing status;
- final approve/hold decision.

Commit message:

- `docs: add release candidate evidence template`

## Native export ADR

Added the accepted architecture decision:

- `docs/adr/native-export-boundary.md`

It records why DiceLab uses a dedicated native save command instead of granting broad filesystem write access to the webview, along with rejected alternatives and verification requirements.

Commit message:

- `docs: record native export architecture decision`

## Architecture/development documentation alignment

Updated earlier in this continuation:

- `docs/architecture.md`
- `docs/development.md`

These now describe:

- English/Hindi locale state and explicit presentation formatting;
- shared Tauri runtime adapter;
- two native commands;
- dedicated native export trust boundary;
- parser fuzzing;
- stale-lock verification rule;
- separate browser versus packaged-native export smoke expectations.

Commit messages:

- `docs: align architecture with locale native export and fuzz boundaries`
- `docs: update development workflow for current boundaries`

## Current dependency blocker remains open

The last observed repository state before this handoff still had:

```toml
tauri-plugin-dialog = "2.7.2"
```

in `src-tauri/Cargo.toml`, while the committed `src-tauri/Cargo.lock` had not yet been observed containing the new direct dependency.

The dependency-lock generator workflow was already improved in the earlier handoff to support manual dispatch and an `automation/lockfiles` fallback branch when protected `main` rejects direct workflow pushes.

Do not hand-edit Cargo transitive entries.

Required release-unblocking sequence remains:

```bash
cd src-tauri
cargo generate-lockfile
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
```

Then observe the full repository/browser/policy/fuzz/release-candidate checks on the resulting exact commit.

## Verification honesty

The commits in this handoff add code, tests, audits, workflows, forms, and documentation. They do not prove that GitHub-hosted workflows have executed successfully.

In particular, do not mark these as release evidence until actually observed:

- generated/current Cargo lockfile;
- locked Rust checks on the new dependency graph;
- full real-browser E2E pass;
- parser fuzz campaign pass;
- repository policy workflow passes;
- native desktop save-dialog smoke on Windows/macOS/Linux;
- benchmark evidence;
- accessibility review;
- CodeQL/dependency/security review;
- real candidate screenshots;
- signing/notarization status;
- artifact checksum/provenance verification;
- `v0.1.0` publication.

## Next continuation priority

1. Regenerate/commit `src-tauri/Cargo.lock` from the current manifest on a network-enabled runner.
2. Run locked Rust tests/Clippy.
3. Run the dependency-free policy/lock audits against that exact commit.
4. Observe frontend unit/integration/build/real-browser E2E.
5. Observe the parser fuzz campaign.
6. Produce Windows/macOS/Linux release-candidate artifacts.
7. Fill a copy of `docs/release-candidate-evidence-template.md` with real evidence.
8. Only then advance screenshots/signing/draft-release publication steps.
