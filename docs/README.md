# DiceLab Documentation Hub

This directory is the engineering and product-documentation index for DiceLab. Start with the README for the product overview, then use this page to locate the exact setup, architecture, security, testing, release, localization, web/PWA, and repository-maintenance reference you need.

## Start here

| Document | Use it for |
| --- | --- |
| [`../README.md`](../README.md) | Product overview, features, quick start, project identity, and primary links |
| [`setup.md`](setup.md) | Prerequisites and initial local setup |
| [`development.md`](development.md) | Day-to-day development conventions and command workflow |
| [`architecture.md`](architecture.md) | System boundaries, modules, runtime split, persistence, native commands, security, and release architecture |
| [`web-pwa.md`](web-pwa.md) | Installable browser/ChromeOS target, offline service worker, web install assets, Tauri exclusion, and verification |
| [`application-flows.md`](application-flows.md) | End-to-end startup, roll, history, probability, localization, backup/export, clear-data, and failure flows |
| [`data-contracts.md`](data-contracts.md) | Domain objects, persistence records, backup schema, error contracts, native command contracts, and locale rules |
| [`repository-file-reference.md`](repository-file-reference.md) | Exhaustive explanation of every Git-tracked file in the repository |

## Product behavior and user-facing quality

| Document | Scope |
| --- | --- |
| [`accessibility.md`](accessibility.md) | Keyboard, focus, screen-reader, motion, zoom/text scaling, and manual review expectations |
| [`localization.md`](localization.md) | Typed catalog model, locale persistence, translation workflow, error localization, and number/date/time formatting |
| [`localization/HINDI_REVIEW.md`](localization/HINDI_REVIEW.md) | Hindi catalog review record and language-specific verification checklist |
| [`web-pwa.md`](web-pwa.md) | Web installability, offline application shell, mobile home-screen metadata, cache/security boundaries, and release smoke |
| [`performance.md`](performance.md) | Performance budgets, benchmark scope, measurement rules, and release evidence |
| [`troubleshooting.md`](troubleshooting.md) | Common setup/runtime/build problems and safe recovery guidance |
| [`../PRIVACY.md`](../PRIVACY.md) | User-data handling and offline/local privacy model |
| [`../SUPPORT.md`](../SUPPORT.md) | Public support, feature-request, bug-report, and private security-report routing |

## Testing and verification

| Document | Scope |
| --- | --- |
| [`testing.md`](testing.md) | Unit, component, integration, Rust, browser E2E, fuzz, policy, benchmark, and manual smoke strategy |
| [`e2e.md`](e2e.md) | Dependency-free Chromium/CDP production-bundle browser runner architecture and debugging |
| [`web-pwa.md`](web-pwa.md) | PWA policy self-tests, production install/offline verification, and manual platform checks |
| [`logging.md`](logging.md) | Structured local logging, privacy-safe context, redaction, and operational-event policy |
| [`automation-reference.md`](automation-reference.md) | Every repository script and GitHub Actions workflow, triggers, responsibilities, and evidence meaning |
| [`repository-policy-gates.md`](repository-policy-gates.md) | Executable architecture/security policy boundaries and their audit commands |
| [`lockfile-policy.md`](lockfile-policy.md) | npm/Cargo manifest-lock consistency and release rules |

## Desktop/native security boundaries

| Document | Scope |
| --- | --- |
| [`native-exports.md`](native-exports.md) | Browser versus native CSV/JSON save behavior and the bounded Rust save command |
| [`native-command-contract.md`](native-command-contract.md) | Approved renderer→Rust commands and command synchronization policy |
| [`runtime-boundary-policy.md`](runtime-boundary-policy.md) | Approved frontend locations for Tauri API access/runtime probing |
| [`capability-policy.md`](capability-policy.md) | Tauri capability allow/deny rules |
| [`tauri-security-policy.md`](tauri-security-policy.md) | CSP and remote-domain IPC repository policy |
| [`offline-network-policy.md`](offline-network-policy.md) | Offline-first CSP network-source policy |
| [`../SECURITY.md`](../SECURITY.md) | Vulnerability reporting and overall security posture |

## Architecture decisions

The ADR index is [`adr/README.md`](adr/README.md). Current records cover:

- modular monolith + Tauri/React structure;
- secure versus deterministic randomness;
- versioned local persistence;
- stable error/localization contracts;
- privacy-safe local logging;
- dependency-free browser E2E;
- native export filesystem boundary.

ADRs preserve *why* a durable choice was made. `architecture.md` describes the current system; ADRs preserve decision history and rejected alternatives.

## Repository and release engineering

| Document | Scope |
| --- | --- |
| [`repository-governance.md`](repository-governance.md) | Branch protection, labels, milestones, Discussions, security settings, and governance rollout |
| [`release.md`](release.md) | Versioning, clean-checkout verification, desktop packaging, native/localization smoke, draft release review, signing, and rollback |
| [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md) | Fill-in template for real candidate evidence across CI, platforms, fuzzing, benchmarks, accessibility, screenshots, checksums, and provenance |
| [`release-blockers-current.md`](release-blockers-current.md) | Current evidence-gated release blockers that must not be marked complete without observation |
| [`../CHANGELOG.md`](../CHANGELOG.md) | User-visible and security-relevant change history |
| [`../ROADMAP.md`](../ROADMAP.md) | Milestone completion and evidence-gated work |
| [`../what_changed.md`](../what_changed.md) | Current continuation/handoff entry point |
| [`handoffs/README.md`](handoffs/README.md) | Index of detailed historical implementation handoffs |

## Contributor/community files

Repository-level contributor material lives at the root or under `.github/`:

- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — contribution workflow and quality expectations;
- [`../CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md) — community behavior expectations;
- `../.github/ISSUE_TEMPLATE/` — structured bug, feature, accessibility, and routing forms;
- `../.github/pull_request_template.md` — verification/security/localization/release checklist;
- `../.github/CODEOWNERS` — review routing for sensitive boundaries;
- `../.github/FUNDING.yml` — optional project-support metadata.

## Documentation maintenance rules

1. Update the closest behavior document in the same change that modifies behavior.
2. Add or supersede an ADR when a durable architecture/security trade-off changes.
3. Keep examples aligned with the actual parser, runtime commands, storage schema, and scripts.
4. Never describe configured automation as observed release evidence.
5. Do not document secrets, private filesystem paths, real user data, signing credentials, or private backups.
6. Keep relative Markdown links valid with `npm run docs:check`.
7. Keep [`repository-file-reference.md`](repository-file-reference.md) synchronized with every tracked file using `npm run docs:inventory`.
8. When a new tracked file is added, explain its purpose, ownership/boundary, and important relationships in the exhaustive reference.

## Recommended reading paths

### New contributor

1. [`../README.md`](../README.md)
2. [`setup.md`](setup.md)
3. [`development.md`](development.md)
4. [`architecture.md`](architecture.md)
5. [`web-pwa.md`](web-pwa.md)
6. [`testing.md`](testing.md)
7. [`repository-policy-gates.md`](repository-policy-gates.md)
8. [`../CONTRIBUTING.md`](../CONTRIBUTING.md)

### Security/native change

1. [`../SECURITY.md`](../SECURITY.md)
2. [`architecture.md`](architecture.md)
3. [`capability-policy.md`](capability-policy.md)
4. [`tauri-security-policy.md`](tauri-security-policy.md)
5. [`offline-network-policy.md`](offline-network-policy.md)
6. [`runtime-boundary-policy.md`](runtime-boundary-policy.md)
7. [`native-command-contract.md`](native-command-contract.md)
8. relevant [`adr/`](adr/) record

### Web/PWA change

1. [`web-pwa.md`](web-pwa.md)
2. [`architecture.md`](architecture.md)
3. [`testing.md`](testing.md)
4. [`offline-network-policy.md`](offline-network-policy.md)
5. [`repository-policy-gates.md`](repository-policy-gates.md)
6. [`release.md`](release.md)

### Localization/UI change

1. [`localization.md`](localization.md)
2. [`localization/HINDI_REVIEW.md`](localization/HINDI_REVIEW.md)
3. [`accessibility.md`](accessibility.md)
4. [`application-flows.md`](application-flows.md)
5. [`testing.md`](testing.md)

### Release preparation

1. [`release-blockers-current.md`](release-blockers-current.md)
2. [`release.md`](release.md)
3. [`testing.md`](testing.md)
4. [`web-pwa.md`](web-pwa.md)
5. [`automation-reference.md`](automation-reference.md)
6. [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md)
7. [`../CHANGELOG.md`](../CHANGELOG.md)
8. [`../ROADMAP.md`](../ROADMAP.md)
