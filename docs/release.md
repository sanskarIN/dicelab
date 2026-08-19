# Release Guide

DiceLab releases should be reproducible, reviewed, and based on a clean commit with passing required checks.

## Version locations

Keep the version aligned in:

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `CHANGELOG.md`

Use semantic-versioning principles. During pre-1.0 development, minor releases may still include deliberate compatibility changes when documented clearly.

## Release prerequisites

Before tagging a release:

1. Ensure dependency lockfiles are committed and current.
2. Verify CI is green on the exact release commit.
3. Run the clean-checkout quality suite.
4. Review dependency/security findings.
5. Complete the accessibility smoke checklist.
6. Capture real screenshots from the release candidate.
7. Update `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md`.
8. Verify version strings match.
9. Confirm the repository contains no credentials or generated signing secrets.

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

The release workflow is tag-driven. It builds supported platform artifacts and uploads them for the GitHub release process.

## Release notes

Release notes should contain:

- user-visible additions and fixes;
- security/privacy changes;
- accessibility changes;
- known limitations;
- upgrade or backup-schema notes;
- platform-specific caveats;
- checksums/signing information when actually produced.

Do not describe planned functionality as shipped functionality.

## Artifact verification

For each produced bundle:

1. Confirm the expected file exists and is non-empty.
2. Install or launch it on the intended platform.
3. Complete a secure roll and a seeded roll.
4. Verify settings persist after restart.
5. Export a backup and restore it.
6. Verify About/version/contact information.
7. Confirm the build contains no development server references.

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
