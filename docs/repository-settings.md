# GitHub Repository Settings

This document records repository settings that cannot be fully represented by committed files or that should be reviewed in the GitHub UI before a release.

## Default branch

Use `main` as the default branch.

## Recommended branch protection / ruleset

After the CI job names are proven stable on the final audit pull request, protect `main` with a GitHub ruleset or branch protection rule that:

- requires pull requests before merging for non-emergency changes;
- requires the final DiceLab CI checks to pass;
- requires CodeQL/security analysis when the repository plan/settings expose it as a required check;
- requires branches to be up to date before merge when practical;
- blocks force pushes and branch deletion;
- dismisses stale approvals after material code changes when multiple reviewers are available;
- allows repository administrators to recover from a broken ruleset only through a documented emergency process.

Do not configure required status-check names until they have actually appeared on a successful pull request. Otherwise a typo or renamed job can make the branch impossible to merge.

## Pull request merge strategy

Preserve meaningful atomic development history. For the initial DiceLab build/audit, prefer a normal merge commit rather than squashing dozens of intentionally separated feature, test, documentation, security, and CI commits into one commit.

For future small contributor pull requests, the maintainer may choose merge or squash based on whether the individual commits are independently useful and reviewable.

## Discussions

If GitHub Discussions is enabled, suggested categories are:

- Announcements — maintainer-only project news;
- General — product/community discussion;
- Ideas — early feature concepts before they become scoped issues;
- Q&A — usage and development questions;
- Show and tell — tabletop/testing workflows or integrations built around DiceLab.

Security vulnerabilities must never be redirected to a public Discussion; follow `SECURITY.md`.

## Suggested labels

Keep the label set small enough to remain useful:

- `bug`
- `enhancement`
- `accessibility`
- `security`
- `privacy`
- `performance`
- `documentation`
- `dependencies`
- `javascript`
- `rust`
- `github-actions`
- `needs-triage`
- `good first issue`
- `help wanted`
- `blocked`

Do not use labels to imply a security report is safe for public disclosure.

## Suggested milestones

Create milestones only when there is a real collection of scoped issues. Initial examples:

- `v0.1.0 — First public release`
- `v0.2.0 — Verification and localization depth`
- `v1.0.0 — Stable product contract`

Avoid creating empty milestones merely for visual activity.

## Security settings

Where supported by the repository/account plan, enable:

- Dependabot alerts;
- Dependabot security updates;
- secret scanning;
- push protection for secrets;
- private vulnerability reporting;
- CodeQL/default code scanning or the committed CodeQL workflow.

The committed workflows/configuration do not replace repository-level security settings.

## Actions permissions

Prefer least privilege:

- default workflow token permissions should be read-only where possible;
- individual workflows should request write permissions only for the specific operation they perform;
- the lockfile workflow is the intentional exception that needs `contents: write` to commit generated lockfiles;
- release signing secrets must be stored as GitHub environment/repository secrets, never in source.

Review third-party action versions before upgrades and keep Dependabot enabled for GitHub Actions.

## Releases

Tag only a commit that has passed the documented release gate. Do not move or rewrite published version tags. Release artifacts should be generated from the tagged source and described accurately as signed/unsigned based on the real build process.

## Funding

`.github/FUNDING.yml` points to the optional Buy Me a Coffee page. Funding must remain optional and must never gate product functionality.

## Contacts

- Business: `sanskarin@outlook.in`
- Support: `supportramsandesh@gmail.com`
- Repository: `https://github.com/sanskarIN/dicelab`

**Made by the Sanskar**
