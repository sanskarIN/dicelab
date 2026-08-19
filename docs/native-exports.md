# Native export design

DiceLab keeps export behavior explicit, local, and narrowly scoped across browser and desktop builds.

## Browser behavior

Browser builds use the normal in-page download path. DiceLab creates a temporary Blob URL, activates a download link after the user presses an export button, removes the link, and revokes the temporary URL.

The browser path does not request native filesystem capabilities.

## Desktop behavior

Tauri desktop builds route CSV and JSON exports through the `save_text_export` Rust command.

The command opens the operating system save dialog itself. The frontend supplies only:

- a bounded suggested filename;
- the text contents to save;
- the requested `csv` or `json` format.

The frontend does not supply a filesystem path.

After the user chooses a destination, the Rust command converts the dialog-selected file path and writes only to that selected destination.

## Validation boundary

Before showing the save dialog, the native command verifies that:

- the suggested filename is non-empty;
- the suggested filename is at most 160 bytes;
- the suggested filename contains no control characters or path separators;
- the requested format is exactly `csv` or `json`;
- the filename extension matches the requested format;
- the payload is no larger than 6,000,000 bytes.

After the user chooses a destination, DiceLab verifies the selected file extension again before writing.

The native error returned to the interface is deliberately generic and does not include the selected private filesystem path.

## Capability model

DiceLab uses the native dialog plugin from Rust but does not grant the webview broad filesystem-write permissions. File creation remains behind a dedicated application command whose accepted formats and payload are bounded by DiceLab.

The desktop capability file therefore does not need broad filesystem or shell permissions for exports.

## Cancellation and failures

Canceling the native save dialog returns a normal `false` result. DiceLab does not silently fall back to a browser download after a desktop cancellation.

A save failure produces localized, user-safe status text. Raw filesystem error text and private paths are not surfaced by the interface.

## Covered export flows

The same boundary is used for:

- filtered history CSV export;
- filtered history JSON export;
- full DiceLab JSON backup export.

Backup import remains a separate validated file-input flow.

## Regression coverage

The repository includes tests for:

- browser versus Tauri runtime detection;
- browser download fallback;
- native command routing;
- native cancellation behavior;
- safe filename and format validation;
- payload size limits;
- selected-extension validation;
- localized export success/failure feedback;
- suppression of raw error details in user-facing export failures.

## Review rule

Any future export format must be added deliberately to both the frontend format union and native allowlist, with an appropriate extension check and regression tests. Do not replace the dedicated command with a broad arbitrary-path write API simply to make a new export type easier to add.
