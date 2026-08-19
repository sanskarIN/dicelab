# DiceLab Continuation Handoffs

This directory preserves detailed implementation checkpoints so ongoing repository work does not depend on chat history.

## Handoff order

1. [`2026-08-19-pre-native-exports.md`](2026-08-19-pre-native-exports.md)
   - Earlier large hardening/verification/release-engineering wave.
   - Preserved byte-for-byte from the previous `what_changed.md` Git blob.

2. [`2026-08-19-native-localization.md`](2026-08-19-native-localization.md)
   - Reviewed Hindi locale and persisted language preference.
   - Locale-aware number/date/time formatting.
   - Native desktop CSV/JSON save-dialog boundary with browser fallback.
   - Parser fuzz harness/workflow.
   - Lockfile workflow hardening and release blocker record.

3. [`2026-08-19-policy-hardening.md`](2026-08-19-policy-hardening.md)
   - Capability/CSP/offline-network policy audits.
   - Localized formatting/runtime/native-command architecture gates.
   - Lockfile consistency audit and release gate.
   - Additional localization lifecycle/failure regressions.
   - CODEOWNERS, issue forms, PR checklist, support/funding metadata.
   - Release-candidate evidence template.

4. [`2026-08-19-documentation-completion.md`](2026-08-19-documentation-completion.md)
   - Complete documentation hub and recommended reading paths.
   - End-to-end application-flow reference.
   - Domain/persistence/native data-contract reference.
   - Maintainer code reference and full automation reference.
   - Exhaustive every-tracked-file catalog.
   - `git ls-files` documentation-inventory audit and integration regression.
   - Contributor/README/ADR/governance documentation corrections.

## Current top-level handoff

[`../../what_changed.md`](../../what_changed.md) remains the top-level continuation entry point. These dated files preserve detail that should not be discarded when `what_changed.md` is refreshed again.

## Verification rule

A handoff records implementation state, not unobserved CI success.

Do not mark an evidence-gated item complete until the corresponding command, workflow, platform smoke test, security review, benchmark, or release artifact has actually been observed for the intended commit/candidate.

## Documentation completeness rule

The detailed documentation wave introduced [`../repository-file-reference.md`](../repository-file-reference.md) and its `git ls-files` audit. New tracked files must be added to that reference in the same change and checked with:

```bash
npm run docs:inventory:test
npm run docs:inventory
```

## Current first blocker

The first release-unblocking task remains to regenerate and commit the Rust lockfile from the current `src-tauri/Cargo.toml`, then observe locked Rust tests/Clippy before advancing the release candidate, unless a later observed repository state proves the lockfile workflow has already landed the generated dependency graph.

Do not hand-edit transitive Cargo lock entries.
