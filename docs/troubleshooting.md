# Troubleshooting

## `npm install` fails

Check:

```bash
node --version
npm --version
```

DiceLab targets Node.js 22+. If a lockfile exists, prefer `npm ci` for a clean reproducible install. Corporate proxies, DNS restrictions, or registry outages can also prevent dependency downloads; fix network/package-manager access rather than deleting project source files.

## Vite port 1420 is already in use

DiceLab's Tauri development configuration expects the Vite development server on port 1420. Stop the process using that port and retry:

```bash
npm run tauri:dev
```

Changing the port requires keeping `vite.config.ts` and `src-tauri/tauri.conf.json` aligned.

## Tauri cannot compile on Linux

Verify the required native development packages are installed. See [`setup.md`](setup.md) for the Ubuntu/Debian package set used by CI. Different distributions use different package names.

## Rust linker or compiler errors on Windows

Confirm the MSVC Rust toolchain and Visual Studio C++ build tools are installed:

```powershell
rustup show
rustup default stable-msvc
```

Then restart the terminal so toolchain environment changes are visible.

## Desktop window is blank in development

1. Confirm `npm run dev` succeeds by itself.
2. Open the Vite development URL in a browser.
3. Check the terminal for frontend compilation errors.
4. Confirm the Tauri dev URL and Vite port still match.
5. Do not weaken the production CSP as a workaround for unrelated build errors.

## An expression is rejected

Valid examples include:

```text
1d20
2d6+3
4d6kh3
2d20kl1
6d10dh2-1
```

Rules include:

- at least one die;
- at least two sides;
- keep count cannot exceed the pool;
- drop count must leave at least one die;
- very large counts/modifiers are deliberately bounded to protect responsiveness and numeric safety.

## Seeded rolls are different after changing settings or sequence

Seeded mode combines the configured seed with a local roll sequence. It is intended for reproducible test sessions, not as a promise that every runtime/language implementation produces the same byte-for-byte stream.

## History or settings are not saved

DiceLab degrades to in-memory operation when browser/webview storage is unavailable. Check whether private browsing policies, storage blocking, quota limits, or manual site-data clearing affected local storage.

## Backup import is rejected

DiceLab accepts its versioned JSON backup format only. Imports are rejected when they are malformed, unsupported, oversized, or contain invalid roll/preset structures.

Do not hand-edit a backup unless you understand the schema. Keep the original exported file before experimenting.

## Probability calculator refuses an expression

Exact keep/drop probability can grow exponentially. DiceLab intentionally refuses calculations beyond its interactive safety limit instead of freezing the UI or presenting an approximation as exact.

Reduce the dice pool/sides or calculate a simpler related expression.

## Theme does not follow the operating system

Set Theme to **System** in Settings. If the OS preference changes while DiceLab is open, the app listens for the color-scheme preference change. Platform/webview behavior can still depend on the operating system's theme support.

## Reduced motion does not appear to change anything

DiceLab motion is intentionally subtle. Reduced-motion mode disables non-essential transitions/animations, and the app also honors the operating system/browser `prefers-reduced-motion` setting.

## Export button appears to do nothing in a browser

Check browser download permissions and blocked-download indicators. Exports are created only after an explicit user action and use the browser's normal download mechanism.

## CI fails

Open the failing GitHub Actions job and fix the first real error rather than retrying repeatedly. Common categories are:

- formatting drift;
- TypeScript/lint errors;
- unit test regressions;
- missing native Linux dependencies;
- Rust formatting/Clippy failures;
- dependency resolution or lockfile drift.

Document infrastructure-only failures separately from code failures.

## Still stuck?

Open a public issue for non-sensitive reproducible bugs or email `supportramsandesh@gmail.com`.

Potential security vulnerabilities belong in the private process described by [`../SECURITY.md`](../SECURITY.md).
