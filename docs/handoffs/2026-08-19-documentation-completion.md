# DiceLab Deep Documentation Completion Handoff — 2026-08-19

This handoff records the documentation-focused continuation that followed the native/localization and repository-policy hardening waves.

Previous detailed handoffs:

- [`2026-08-19-pre-native-exports.md`](2026-08-19-pre-native-exports.md)
- [`2026-08-19-native-localization.md`](2026-08-19-native-localization.md)
- [`2026-08-19-policy-hardening.md`](2026-08-19-policy-hardening.md)

Current top-level continuation entry point:

- [`../../what_changed.md`](../../what_changed.md)

## Goal of this wave

The user requested deep, complete repository documentation without skipping files. This wave therefore does more than add prose: it creates an exhaustive tracked-file catalog plus an executable audit that fails when a new tracked file is not documented.

## Documentation architecture added

### Documentation hub

Added [`../README.md`](../README.md) as the documentation navigation hub.

It organizes references by:

- onboarding/setup;
- architecture/code/data flows;
- product behavior/accessibility/localization;
- testing/automation;
- desktop/native security;
- ADRs;
- repository governance/release engineering;
- contributor/community material;
- recommended reading paths for contributors, security/native changes, localization/UI work, and release preparation.

### End-to-end application flow reference

Added [`../application-flows.md`](../application-flows.md).

It documents actual application execution flows rather than only directory structure:

- startup state loading;
- persistence side effects;
- theme/motion/document-language application;
- navigation and command palette;
- roll validation and runtime selection;
- secure versus seeded randomness;
- keep/drop semantics;
- preset creation/deletion/localization;
- history filtering/statistics/progressive rendering;
- probability calculation;
- locale switching;
- browser/native export branching;
- backup export/import validation/restoration;
- local-storage recovery;
- clear-all-data reset;
- onboarding;
- root error recovery;
- local redacted logging;
- release verification progression.

### Data and boundary contracts

Added [`../data-contracts.md`](../data-contracts.md).

It records stable/bounded contracts for:

- dice expressions;
- parser error codes/context;
- die/roll invariants;
- randomness modes;
- presets/reserved built-in IDs;
- probability distribution/error budgets;
- settings/defaults/normalization;
- locales and explicit Intl mappings;
- versioned local-storage keys;
- backup schema v1, size/count limits, and validation errors;
- history CSV format and formula neutralization;
- browser/native text export API;
- native roll/save commands;
- native command allowlist;
- runtime detection;
- structured logging;
- version synchronization;
- manifest/lockfile relationship;
- compatibility-change checklist.

### Maintainer code reference

Added [`../code-reference.md`](../code-reference.md).

It documents the production code by dependency direction and module responsibility:

- bootstrap/coordinator;
- every React component responsibility;
- config metadata;
- every TypeScript domain module;
- every i18n module;
- every service module;
- styling/test environment;
- native Rust source/config/capability/fuzz files;
- build/test naming conventions;
- change-routing cheat sheet.

### Automation reference

Added [`../automation-reference.md`](../automation-reference.md).

It documents:

- complete npm command surface;
- every dependency-free Node script;
- documentation/secret/version/release/policy audits;
- every GitHub Actions workflow;
- release workflow jobs and draft packaging;
- lockfile regeneration behavior;
- Dependabot/release-notes/community metadata;
- configuration versus execution versus release evidence.

## Exhaustive file documentation enforcement

Added:

- `scripts/check-file-reference.mjs`
- `scripts/check-file-reference.test.mjs`
- `scripts/check-file-reference.integration.test.mjs`

The auditor uses:

```bash
git ls-files -z
```

to retrieve the actual tracked-file set, then compares it with first-column paths in:

- [`../repository-file-reference.md`](../repository-file-reference.md)

It reports:

- tracked files missing from the documentation;
- documented paths that are no longer tracked.

The integration test audits the real checked-out repository rather than only synthetic fixtures.

Package scripts added:

```text
docs:check:test
docs:inventory
docs:inventory:test
release:verify
release:verify:test
policy:capabilities
policy:tauri-security
policy:offline-csp
policy:localized-formatting
policy:runtime
policy:native-commands
policy:lockfiles
policy:boundaries
policy:test
policy:all
```

This also fixes a pre-existing automation mismatch where `repository-audit.yml` referenced documentation/release self-test command names that were not exposed in `package.json`.

## ADR index correction

`docs/adr/README.md` previously listed only ADR-0001 through ADR-0003 even though later decisions already existed.

It now indexes:

- ADR-0001 modular monolith;
- ADR-0002 randomness modes;
- ADR-0003 local persistence;
- ADR-0004 stable error/localization contract;
- ADR-0005 privacy-safe logging;
- ADR-0006 dependency-free browser E2E;
- native export boundary decision.

It also documents how to add/supersede ADRs without rewriting historical decisions.

## Contributor/governance documentation corrections

### `CONTRIBUTING.md`

Corrected the stale statement that English was the only shipped locale. It now documents the reviewed English/Hindi product, shared Intl formatting, locale compatibility requirements, policy commands, exhaustive file inventory, native command/runtime boundaries, lockfile rules, release evidence, and documentation maintenance expectations.

### `.github/pull_request_template.md`

Expanded from the older basic checklist to cover:

- secret/policy/doc/version/browser checks;
- locked Rust verification;
- English/Hindi catalog updates;
- locale-sensitive formatter boundary;
- user-created-content preservation;
- accessibility;
- Tauri runtime/command/capability/CSP boundaries;
- privacy-safe errors/logging;
- generated lockfiles;
- documentation/ADR/roadmap/handoff updates;
- observed evidence versus configured CI.

### `.github/CODEOWNERS`

Expanded explicit ownership for:

- native trust-boundary files;
- repository policy scripts;
- workflows;
- security policy;
- npm/Cargo manifests and locks;
- Tauri config;
- changelog/roadmap;
- ADR/release/governance/policy/blocker/handoff documentation.

## Exhaustive tracked-file catalog

The centerpiece of this wave is:

- [`../repository-file-reference.md`](../repository-file-reference.md)

It is organized into sections for root metadata, GitHub/community automation, docs/ADRs/handoffs, repository scripts, native Rust/Tauri, frontend application, components/tests, domain/tests/benchmarks, localization/tests, services/tests, styling/test setup, and TypeScript/Vite/Vitest configuration.

Every tracked file is listed by exact path in the first table column so `npm run docs:inventory` can enforce completeness mechanically.

## Automation integration

The repository audit workflow is updated to run:

```text
npm run docs:inventory:test
npm run docs:inventory
```

alongside the existing secret, link, E2E-infrastructure, version, and release-verifier repository invariants.

This means adding a tracked file without documenting it becomes an explicit CI-visible documentation regression.

## README/documentation discoverability

The top-level README is updated to make [`../README.md`](../README.md) the documentation hub and surface the new deep references, including application flows, data contracts, code reference, automation reference, repository file reference, policy gates, release blockers, and release evidence template.

## Verification honesty

This documentation wave verifies repository content/relationships through the connected GitHub repository and adds executable audits/tests, but does not convert unobserved GitHub Actions runs into passing release evidence.

The first release blocker remains the Rust dependency lockfile unless a later observed repository state shows the generated `src-tauri/Cargo.lock` contains the native dialog dependency and locked Rust checks pass.

## Next continuation priority after documentation completion

1. Re-check generated Cargo lockfile state after the package/lockfile workflow triggers.
2. If current, inspect/record locked Rust workflow evidence; if stale, regenerate from a network-enabled runner.
3. Run/observe documentation inventory, repository policy, unit/integration/build, browser E2E, fuzz, and release candidate checks.
4. Fill a copy of the release-candidate evidence template from real candidate runs/artifacts.
5. Only then advance evidence-gated roadmap items and release publication.
