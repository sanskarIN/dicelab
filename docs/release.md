# Release Guide

DiceLab releases should be reproducible, reviewed, and based on a clean commit with passing required checks.

## Version locations

Keep the version aligned in:

- `package.json`
- `src/config/app.ts`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `CHANGELOG.md`

Use semantic-versioning principles. During pre-1.0 development, minor releases may still include deliberate compatibility changes when documented clearly.

## Release prerequisites

Before tagging a release:

1. Ensure `package-lock.json` and `src-tauri/Cargo.lock` are committed and current.
2. Verify CI is green on the exact release commit.
3. Run the clean-checkout quality suite.
4. Review dependency/security findings.
5. Complete the accessibility smoke checklist.
6. Capture real screenshots from the release candidate.
7. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
8. Verify every version location matches.
9. Confirm the repository contains no credentials or generated signing secrets.
10. Confirm seeded web/desktop compatibility reference-vector tests pass.

## Clean-checkout verification

From a new clone:

```bash
git clone https://github.com/sanskarIN/dicelab.git
cd dicelab
npm ci
npm run format
npm run lint
npm run test
npm run build

cd src-tauri
cargo fmt --all -- --check
cargo test --locked
cargo clippy --all-targets --all-features --locked -- -D warnings
cd ..
```

Desktop packaging:

```bash
npm run tauri:build
```

Repeat packaging on Windows, macOS, and Linux because native bundles are platform-specific.

## Signing and notarization

Signing credentials are deployment secrets. Never store private keys, certificates, passwords, or notarization credentials in the repository.

If signing is configured through CI, use repository/environment secrets and least-privilege permissions. A release without configured signing must be described accurately; do not claim artifacts are signed when they are not.

## Tagging

Create an annotated version tag from the verified commit, for example:

```bash
git tag -a v0.1.0 -m "DiceLab v0.1.0"
git push origin v0.1.0
```

The tag-driven release workflow then:

1. runs the frontend format, lint, test, and production-build checks with `npm ci`;
2. builds Windows, macOS, and Linux desktop bundles after locked Rust tests/Clippy checks;
3. uploads each platform artifact to the workflow run;
4. downloads only artifacts produced by successful prerequisite jobs;
5. creates a ZIP per artifact set;
6. generates `SHA256SUMS.txt` for the ZIP files;
7. creates or updates a **draft** GitHub release for the tag and uploads the packages/checksums.

The workflow deliberately leaves the release as a draft. A human maintainer must still install/smoke-test the produced bundles and review generated notes before publishing.

## Draft release review

Before publishing the draft:

- download each uploaded ZIP and compare its SHA-256 digest with `SHA256SUMS.txt`;
- extract and inspect expected platform files;
- complete the artifact smoke matrix below;
- replace or edit generated notes so they accurately match `CHANGELOG.md`;
- clearly state whether artifacts are unsigned, signed, notarized, or otherwise platform-verified;
- attach release screenshots only if they come from the candidate build;
- keep the release draft if any blocker remains.

## Release notes

Release notes should contain:

- user-visible additions and fixes;
- security/privacy changes;
- accessibility changes;
- deterministic RNG compatibility changes;
- known limitations;
- upgrade or backup-schema notes;
- platform-specific caveats;
- checksums/signing information when actually produced.

Do not describe planned functionality as shipped functionality.

## Artifact verification

For each produced bundle:

1. Confirm the expected file exists and is non-empty.
2. Verify the ZIP digest against `SHA256SUMS.txt`.
3. Install or launch it on the intended platform.
4. Complete a secure roll and a seeded roll.
5. Compare a documented seeded reference case with the web companion.
6. Verify settings persist after restart.
7. Export a backup and restore it.
8. Verify About/version/contact information.
9. Confirm the build contains no development server references.
10. Verify reduced-motion and keyboard navigation behavior.

## Rollback

If a release has a serious defect:

- mark the affected release clearly;
- publish a fixed patch release from a reviewed commit;
- document the affected versions and workaround where appropriate;
- never rewrite a published release tag to hide history.

## Release ownership

Project/business contact: `sanskarin@outlook.in`

Support: `supportramsandesh@gmail.com`

**Made by the Sanskar**
