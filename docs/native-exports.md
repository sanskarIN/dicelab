# Native export design

DiceLab keeps export behavior explicit, local, and narrowly scoped across browser, desktop, and mobile builds.

## Browser behavior

Browser builds use the normal in-page download path. DiceLab creates a temporary Blob URL, activates a download link after the user presses an export button, removes the link, and revokes the temporary URL.

The browser path does not request native filesystem capabilities.

## Native Tauri behavior

Windows, macOS, Linux, Android, and iOS/iPadOS builds route CSV and JSON exports through the `save_text_export` Rust command.

The command opens the operating-system save/document dialog itself. The frontend supplies only:

- a bounded suggested filename;
- the text contents to save;
- the requested `csv` or `json` format.

The frontend does **not** supply an arbitrary filesystem path or document-provider URI.

After the user chooses a destination, the Rust command receives Tauri's `FilePath` abstraction and writes only to that selected destination through `tauri-plugin-fs`.

### Desktop paths

Windows, macOS, and Linux selections normally resolve to filesystem paths. DiceLab validates the selected path extension again before writing.

### Android document-provider URIs

Android's Storage Access Framework/document providers can return `content://` selections instead of ordinary filesystem paths. A `content://` URI must not be converted into a `std::path::Path` and passed to `std::fs::write`.

DiceLab therefore passes the dialog-selected `FilePath` directly to `tauri-plugin-fs`. The filesystem plugin handles the Android content resolver/native file-descriptor bridge without exposing broad filesystem access to the renderer.

The suggested filename has already been validated before the picker is shown. For URI-backed selections whose path cannot be resolved locally, the native command relies on the operating-system document picker/provider to preserve the chosen document type/name and writes only to the returned selection.

Physical-device release testing remains required because third-party/cloud document providers can differ by Android version and vendor even when compilation succeeds.

### iOS/iPadOS selected files

Apple file-picker selections may use security-scoped access. DiceLab opens the selected `FilePath` through `tauri-plugin-fs`, writes/synchronizes the contents, then explicitly calls `stop_accessing_security_scoped_resource` after the operation.

Physical iPhone/iPad release testing must exercise cancellation, successful CSV/JSON/backup export, provider failure behavior, safe-area layout around the picker transition, and persistence after returning to DiceLab.

## Validation boundary

Before showing the native save dialog, the command verifies that:

- the suggested filename is non-empty;
- the suggested filename is at most 160 bytes;
- the suggested filename contains no control characters or path separators;
- the requested format is exactly `csv` or `json`;
- the filename extension matches the requested format;
- the payload is no larger than 6,000,000 bytes.

When a selected destination resolves to a normal filesystem path, DiceLab verifies its extension again before writing. URI-backed Android selections cannot safely be treated as local filesystem paths, so the pre-dialog filename/format validation and operating-system picker contract remain the format boundary there.

Native errors returned to the interface are deliberately generic and do not include a selected private path, file URL, or content-provider URI.

## Capability model

DiceLab initializes the dialog and filesystem plugins from Rust but does not grant the webview broad filesystem-write permissions. The renderer capability remains the minimal `core:default` scope for the `main` window across Linux, macOS, Windows, Android, and iOS.

File creation remains behind the dedicated application command whose accepted formats, suggested filenames, and payload sizes are bounded by DiceLab. The filesystem plugin is an implementation detail behind the Rust command rather than a general renderer file API.

Do not add broad `fs:*`, shell, process, or network permissions merely to support exports.

## Cancellation and failures

Canceling a native save/document dialog returns a normal `false` result. DiceLab does not silently fall back to a browser download after native cancellation.

A save failure produces localized, user-safe status text. Raw filesystem errors, private paths, file URLs, content URIs, and provider details are not surfaced by the interface.

## Covered export flows

The same boundary is used for:

- filtered history CSV export;
- filtered history JSON export;
- full DiceLab JSON backup export.

Backup import remains a separate validated file-input flow.

## Regression and release coverage

The repository includes automated coverage for:

- browser versus Tauri runtime detection;
- browser download fallback;
- native command routing;
- native cancellation behavior;
- safe filename and format validation;
- payload size limits;
- selected-path extension validation where a path exists;
- localized export success/failure feedback;
- suppression of raw error details in user-facing export failures;
- locked Rust build/test/Clippy in normal native quality checks;
- Android and iOS compilation jobs in CI.

Compiler and unit coverage cannot prove platform document-picker behavior. Before release, record native export smoke evidence on Windows, macOS, Linux, a physical Android device, and physical iPhone/iPad targets as described in [`release.md`](release.md).

## Review rule

Any future export format must be added deliberately to both the frontend format union and native allowlist, with an appropriate filename/type check, platform review, and regression tests. Do not replace the dedicated command with a broad arbitrary-path/URI write API simply to make a new export type easier to add.
