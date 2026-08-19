# ADR: Keep desktop exports behind a dedicated native save command

- Status: Accepted
- Date: 2026-08-19
- Decision owners: DiceLab maintainers

## Context

DiceLab supports CSV/JSON history export and JSON backup export in both the browser companion and the Tauri desktop application.

The browser can satisfy these workflows with its normal Blob/download mechanism. Desktop users benefit from a native operating-system save dialog, but adding desktop file output introduces a trust-boundary decision: whether to grant the webview general filesystem-write capability or keep file creation behind application-owned native code.

DiceLab is offline-first and intentionally keeps Tauri capabilities narrow. A broad arbitrary-path write API would increase the impact of a compromised renderer, UI injection bug, or future unsafe frontend dependency.

## Decision

Desktop text exports use a purpose-built Rust command named `save_text_export`.

The frontend may provide only:

- a bounded suggested filename;
- bounded text contents;
- an allowlisted export format (`csv` or `json`).

The frontend does not provide the destination filesystem path.

Rust opens the operating-system save dialog, receives the selected path from that native dialog, revalidates the final extension, and writes only to the selected destination.

The command validates the suggested filename, format, extension, and payload size before writing. Cancellation is represented as a normal non-error result. Native write failures are converted to generic user-safe failures without returning the selected private path to presentation code.

Browser builds retain the ordinary Blob/download implementation and do not attempt to invoke the native command.

## Consequences

### Benefits

- The webview does not need broad filesystem-write permission.
- The destination path comes from an explicit user gesture in the operating-system dialog.
- The accepted file types are small and auditable.
- Browser and desktop behavior can share serialization while keeping platform-specific output behind a service adapter.
- Native errors can be sanitized at the Rust boundary before they reach localized UI copy.
- Future security review has one narrow native write path to inspect.

### Costs

- Every new export format requires an intentional native allowlist update and tests.
- Browser and desktop save behavior require separate smoke coverage.
- The Tauri dialog plugin adds a Rust dependency and therefore requires a regenerated Cargo lockfile and dependency review.
- Native save-dialog behavior cannot be fully proven by browser-only E2E automation.

## Alternatives considered

### Grant a general filesystem plugin permission to the webview

Rejected. It would make frontend code responsible for arbitrary path selection/writes and materially widen the renderer trust boundary for workflows that only need user-selected exports.

### Keep browser-style downloads inside Tauri

Rejected as the only desktop path. It avoids the native dependency but provides a weaker desktop file-selection experience and makes output destination behavior dependent on embedded webview download handling.

### Pass a frontend-selected path into a Rust write command

Rejected. It would move the actual write into Rust but still let compromised renderer code choose arbitrary paths. The selected path should originate from the native user dialog instead.

### Add a general-purpose native file service for future features

Deferred. Current product requirements do not justify the larger capability surface. A future feature that genuinely needs broader filesystem access requires a separate ADR, explicit capability review, and new tests.

## Verification requirements

Changes to this decision must keep or replace the following protections:

- runtime/browser-native routing tests;
- browser download regression coverage;
- native format/filename/payload validation tests;
- final selected-extension validation;
- cancellation behavior tests;
- localized safe export failure tests;
- packaged Windows/macOS/Linux manual save-dialog smoke checks;
- capability review confirming no unintended broad filesystem/shell access.

A manifest change associated with this boundary is not release-ready until the generated `src-tauri/Cargo.lock` is committed and locked Rust checks are observed.

## Related documents

- [`../native-exports.md`](../native-exports.md)
- [`../architecture.md`](../architecture.md)
- [`../testing.md`](../testing.md)
- [`../release.md`](../release.md)
- [`../../SECURITY.md`](../../SECURITY.md)
