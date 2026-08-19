# Repository Governance

DiceLab is a public open-source project. Repository settings should reinforce the same reliability, privacy, accessibility, and review standards enforced in source control without making routine maintenance impossible.

This document describes the intended GitHub configuration. Settings that are not representable as repository files must be reviewed in the GitHub UI by a maintainer with administration access.

## Default branch

- Default branch: `main`.
- Do not force-push or rewrite published release history.
- Prefer pull requests for external contributions and substantial changes.
- Small maintainer changes may be committed directly while the project is pre-1.0, but only when the same quality checks are run or observed afterward.

## Branch protection rollout

Do **not** enable a required-status rule by guessing check names or while Actions status visibility is unverified. First observe at least one successful pull-request run and confirm the exact check names exposed by GitHub.

After that verification, protect `main` with these minimum rules:

1. Require a pull request before merging for non-maintainer contributors.
2. Require at least one approving review for externally authored changes.
3. Dismiss stale approvals after new commits for security-sensitive or release changes.
4. Require conversation resolution before merge.
5. Require the observed equivalents of:
   - CI / Web quality;
   - CI / Rust quality;
   - CodeQL / JavaScript and TypeScript analysis.
6. Require branches to be up to date when the project has enough CI capacity to make that practical.
7. Block force pushes and branch deletion.
8. Keep administrator bypass available only for recovery, dependency-lock automation, or urgent security maintenance, and document any bypass in the pull request/release notes when material.

The `Dependency lockfiles` workflow currently needs `contents: write` because it can commit regenerated lockfiles to `main`. If branch protection later blocks that maintenance path, prefer converting lockfile regeneration to an automated pull request rather than weakening protection for all writers.

## Security settings

For the public repository, enable the platform security features available to the account/repository where possible:

- Dependabot alerts and security updates;
- dependency graph;
- CodeQL/code scanning alerts;
- secret scanning;
- secret-scanning push protection;
- private vulnerability reporting.

Repository CI also runs DiceLab's dependency-free high-confidence secret audit. That local audit is defense in depth and does not replace GitHub's own secret scanning or credential rotation after an exposure.

Never commit signing certificates, private keys, API tokens, production credentials, user exports, or personal roll-history backups.

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
| `good first issue` | Small, clearly scoped contribution |
| `help wanted` | Maintainer welcomes community implementation |
| `blocked` | Waiting on external tooling/evidence/decision |

Avoid applying a `security` label to a public issue that would expose an exploitable vulnerability. Follow `SECURITY.md` instead.

## Milestones

Use milestones for outcome-based release coordination rather than arbitrary dates. Recommended pre-1.0 milestones:

- `v0.1.0 Release Candidate` — clean CI, platform bundles, real screenshots, artifact smoke tests, accessibility/security review.
- `v0.1.0` — fixes found during candidate verification and publication readiness.
- `v1.0.0` — stable compatibility/documentation/release criteria after pre-1.0 feedback.

Post-1.0 ideas should remain in `ROADMAP.md` or issues until there is a concrete release target.

## GitHub Discussions

If Discussions is enabled, recommended categories are:

- **Announcements** — maintainer-only release/project announcements;
- **Q&A** — usage and development questions;
- **Ideas** — early product suggestions before an issue is actionable;
- **Show and tell** — tabletop workflows, integrations, or learning examples built around DiceLab.

Do not use Discussions for vulnerability disclosure, private support data, or pasted backups containing personal information.

## Issue and pull-request intake

The repository includes structured bug and feature templates plus a pull-request checklist. Maintainers should:

- ask for the smallest reproducible example;
- remove or redact private data from public reports;
- prefer linked regression tests for fixes;
- require screenshots only when they add useful UI evidence;
- require documentation updates when behavior or setup changes;
- move sensitive vulnerability reports to the private process in `SECURITY.md`.

## Release governance

A version tag triggers cross-platform packaging and creates/updates a **draft** GitHub release. A draft must remain unpublished until maintainers have:

1. observed the release workflow succeed;
2. downloaded all expected artifacts;
3. verified `SHA256SUMS.txt`;
4. installed or launched the supported platform builds;
5. completed the release smoke matrix in `docs/release.md`;
6. captured real screenshots from the verified candidate;
7. reviewed dependency/security findings;
8. confirmed version/changelog/release-note consistency.

Signing/notarization status must be described accurately. Never present an unsigned artifact as signed.

## Funding

`.github/FUNDING.yml` and README documentation point to the optional Buy Me a Coffee profile. Funding must remain non-intrusive and must never gate DiceLab features or support.

## Maintenance review cadence

At each release candidate, review:

- branch/ruleset required checks;
- stale labels and milestones;
- open security/dependency alerts;
- Dependabot configuration;
- Actions permissions;
- release/environment secrets;
- Discussions categories and moderation needs;
- `SECURITY.md`, `SUPPORT.md`, and contact details.

Repository settings can drift even when source files do not, so this review is part of Phase 6 release evidence.
