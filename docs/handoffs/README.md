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

## Current top-level handoff

[`../../what_changed.md`](../../what_changed.md) remains the top-level continuation entry point. These dated files preserve detail that should not be discarded when `what_changed.md` is refreshed again.

## Verification rule

A handoff records implementation state, not unobserved CI success.

Do not mark an evidence-gated item complete until the corresponding command, workflow, platform smoke test, security review, benchmark, or release artifact has actually been observed for the intended commit/candidate.

## Current first blocker

The first release-unblocking task remains to regenerate and commit the Rust lockfile from the current `src-tauri/Cargo.toml`, then observe locked Rust tests/Clippy before advancing the release candidate.

Do not hand-edit transitive Cargo lock entries.
