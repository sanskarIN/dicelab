# Repository Governance

DiceLab is a public open-source project. Repository settings should reinforce the same reliability, privacy, accessibility, localization, least-privilege, documentation, and review standards enforced in source control without making routine maintenance impossible.

This document describes the intended GitHub configuration. Settings that are not representable as repository files must be reviewed in the GitHub UI by a maintainer with administration access.

## Default branch

- Default branch: `main`.
- Current release-preparation target: `v2.0.12`.
- Do not force-push or rewrite published release history.
- Prefer pull requests for external contributions and substantial changes.
- Small maintainer changes may be committed directly only when the same relevant quality checks are run or observed afterward.
- Keep release/evidence history in source-controlled handoffs, changelog, roadmap, and release-candidate evidence records rather than relying on chat or local memory.

## Branch protection rollout

Do **not** enable a required-status rule by guessing check names or while Actions status visibility is unverified. First observe at least one successful pull-request run and confirm the exact check names exposed by GitHub.

After that verification, protect `main` with these minimum rules:

1. Require a pull request before merging for non-maintainer contributors.
2. Require at least one approving review for externally authored changes.
3. Dismiss stale approvals after new commits for security-sensitive or release changes.
4. Require conversation resolution before merge.
5. Require the observed equivalents of the always-running checks, including:
   - CI / Web quality;
   - CI / Rust quality;
   - Repository audit / Dependency-free repository invariants;
   - CodeQL / JavaScript and TypeScript analysis.
6. Require branches to be up to date when the project has enough CI capacity to make that practical.
7. Block force pushes and branch deletion.
8. Keep administrator bypass available only for recovery, dependency-lock automation, or urgent security maintenance, and document any bypass in the pull request/release notes when material.

### Path-filtered policy workflows

DiceLab also has focused workflows for capabilities, Tauri security configuration, offline CSP, localized formatting, runtime boundaries, native command contracts, aggregate repository policy, npm dependency audit, and release-only lock/policy verification.

Several of these intentionally use path filters. Do **not** make a path-filtered check a universal required status unless the GitHub ruleset is configured so unrelated changes cannot become permanently blocked by a check that never runs.

Prefer the always-running `Repository audit` as the universal dependency-free repository invariant status, then use focused policy checks as additional evidence on affected changes. If a focused workflow is converted to always run in the future, its observed emitted status may then become a candidate required check.

The tag-driven release workflow also runs documentation inventory and repository policy gates directly before producing artifacts. Separate focused workflows remain defense in depth and additional evidence rather than the only protection on a release tag.

## Lockfile automation and branch protection

The `Dependency lockfiles` workflow needs `contents: write` because it may commit generated npm/Cargo lockfiles.

Its current behavior:

1. generate `package-lock.json` and `src-tauri/Cargo.lock` using the package managers;
2. verify generated locked Cargo metadata and generated diff hygiene;
3. commit only when generated files changed;
4. rebase onto current `main`;
5. try a direct generated commit to `main`;
6. if protection rejects that write, publish the exact generated commit to `automation/lockfiles` for review/application.

If repository policy evolves, prefer an automation pull-request path over weakening protection for all writers. Never solve protected-branch friction by hand-editing transitive Cargo lock entries.

## Security settings

For the public repository, enable the platform security features available to the account/repository where possible:

- Dependabot alerts and security updates;
- dependency graph;
- CodeQL/code scanning alerts;
- secret scanning;
- secret-scanning push protection;
- private vulnerability reporting.

Repository CI also runs DiceLab's dependency-free high-confidence secret audit. That local audit is defense in depth and does not replace GitHub's own secret scanning or credential rotation after an exposure.

Never commit signing certificates, private keys, API tokens, production credentials, user exports, personal roll-history backups, or private filesystem details.

## Repository policy gates

The repository contains executable audits for boundaries that can remain syntactically valid while still becoming unsafe or inconsistent:

- Tauri capabilities;
- Tauri CSP/remote-domain IPC;
- offline CSP network sources;
- locale-sensitive UI formatting;
- production Tauri runtime access;
- renderer→Rust native command allowlist/routing;
- direct manifest/lock consistency;
- exhaustive tracked-file documentation coverage.

See [`repository-policy-gates.md`](repository-policy-gates.md), [`automation-reference.md`](automation-reference.md), and [`lockfile-policy.md`](lockfile-policy.md).

A maintainer should not weaken an auditor just to make an implementation pass. If a product requirement genuinely changes a boundary, document the need/alternatives, update tests, update the audit deliberately, and add/supersede an ADR when the decision is durable.

## Labels

Keep labels few enough to be useful. Recommended label set:

| Label | Purpose |
| --- | --- |
| `bug` | Confirmed or reported defect |
| `enhancement` | Product improvement or new capability |
| `accessibility` | Keyboard, screen-reader, contrast, motion, zoom, semantics |
| `security` | Non-sensitive security hardening/tracking; vulnerabilities remain private |
| `privacy` | Data handling, persistence, exports, disclosure |
| `performance` | Profiling, benchmarks, responsiveness, bundle size |
| `testing` | Test infrastructure or coverage |
| `documentation` | Documentation-only or documentation-led work |
| `dependencies` | Dependency/lockfile maintenance |
| `release` | Packaging, signing, screenshots, release-candidate verification |
| `windows` | Windows-specific behavior |
| `macos` | macOS-specific behavior |
| `linux` | Linux-specific behavior |
| `web` | Browser companion-specific behavior |
| `localization` | Translation/catalog/locale-formatting/persistence work |
| `governance` | Repository settings, ownership, policy gates, issue/PR process |
| `good first issue` | Small, clearly scoped contribution |
| `help wanted` | Maintainer welcomes community implementation |
| `blocked` | Waiting on external tooling/evidence/decision |

Avoid applying a `security` label to a public issue that would expose an exploitable vulnerability. Follow `SECURITY.md` instead.

## Milestones

Use milestones for outcome-based release coordination rather than arbitrary dates. Recommended current milestones:

- `v2.0.12 Release Candidate` — current generated locks, clean CI/policy/fuzz/browser evidence, platform bundles, native-save/localization/accessibility smoke, real screenshots, artifact/security review.
- `v2.0.12` — fixes found during candidate verification and publication readiness.
- `Next` — post-2.0.12 work that is accepted but not yet assigned to a concrete semantic version.

Future ideas should remain in `ROADMAP.md` or issues until there is a concrete release target.

## GitHub Discussions

If Discussions is enabled, recommended categories are:

- **Announcements** — maintainer-only release/project announcements;
- **Q&A** — usage and development questions;
- **Ideas** — early product suggestions before an issue is actionable;
- **Show and tell** — tabletop workflows, integrations, or learning examples built around DiceLab.

Do not use Discussions for vulnerability disclosure, private support data, or pasted backups containing personal information.

## Issue and pull-request intake

The repository includes structured bug, feature, and accessibility templates plus public issue routing and a detailed pull-request checklist.

Maintainers should:

- ask for the smallest reproducible example;
- remove or redact private data from public reports;
- route vulnerabilities to the private process in `SECURITY.md`;
- prefer linked regression tests for fixes;
- require real screenshots only when they add useful UI evidence;
- require documentation updates when behavior, setup, contracts, or policy changes;
- require `docs/repository-file-reference.md` updates when tracked files are added/renamed/deleted;
- require generated lockfiles when dependency manifests change;
- distinguish checks actually run from checks merely configured in YAML.

## CODEOWNERS

`.github/CODEOWNERS` provides default ownership and explicit review routing for native/security/release/policy/documentation boundaries.

CODEOWNERS does not replace human judgment: a change that touches a sensitive boundary indirectly (for example a component beginning to invoke Tauri directly) still requires the same architectural/security review even if the changed path itself is not a specifically listed sensitive file.

## Release governance

The intended next published tag is `v2.0.12`. A version tag triggers cross-platform packaging and creates/updates a **draft** GitHub release. A draft must remain unpublished until maintainers have:

1. confirmed current npm/Cargo generated locks on the exact 2.0.12 candidate;
2. observed the release workflow and relevant policy/lock/security checks succeed;
3. downloaded all expected artifacts;
4. verified `SHA256SUMS.txt` and `RELEASE-METADATA.json` source/tag/run identity;
5. installed or launched the supported Windows/macOS/Linux builds;
6. completed secure/seeded roll parity smoke;
7. completed native CSV/JSON/backup save/cancel/failure smoke;
8. completed English/Hindi persistence/presentation/layout review;
9. completed keyboard/screen-reader/text-scaling/reduced-motion review;
10. captured real screenshots from the verified candidate;
11. reviewed dependency/CodeQL/repository-security findings;
12. confirmed version/changelog/release-note consistency and that About/Settings report `2.0.12`;
13. recorded signing/notarization status accurately;
14. filled the release-candidate evidence record sufficiently to make an explicit approve/hold decision.

Use [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md). Current known blockers are listed in [`release-blockers-current.md`](release-blockers-current.md).

Signing/notarization status must be described accurately. Never present an unsigned artifact as signed.

## Funding

`.github/FUNDING.yml` and README documentation point to the optional Buy Me a Coffee profile. Funding must remain non-intrusive and must never gate DiceLab features or support.

## Documentation governance

The documentation hub is [`README.md`](README.md) in this directory. The exhaustive tracked-file reference is [`repository-file-reference.md`](repository-file-reference.md).

Every tracked-file addition/rename/deletion should update the reference and pass:

```bash
npm run docs:inventory:test
npm run docs:inventory
npm run docs:check
```

A new durable architecture/security choice should also add or supersede an ADR rather than rewriting history.

## Maintenance review cadence

At each release candidate, review:

- branch/ruleset required checks and whether they actually emit for the relevant event;
- stale labels and milestones;
- open security/dependency alerts;
- Dependabot configuration;
- Actions permissions and third-party action versions;
- release/environment secrets;
- CODEOWNERS and sensitive path coverage;
- documentation inventory/link audits;
- issue/PR templates and security routing;
- Discussions categories and moderation needs;
- `SECURITY.md`, `PRIVACY.md`, `SUPPORT.md`, and contact details;
- current release blockers/evidence template.

Repository settings can drift even when source files do not, so this review is part of the 2.0.12 final release evidence.
