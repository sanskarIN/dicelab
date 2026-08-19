# Development Setup

DiceLab has two development targets:

1. the Vite web companion;
2. the Tauri desktop application.

## Common prerequisites

Install:

- Git;
- Node.js 22 or newer;
- npm;
- Rust stable through rustup for desktop work.

Clone the repository:

```bash
git clone https://github.com/sanskarIN/dicelab.git
cd dicelab
npm install
```

Run only the web companion:

```bash
npm run dev
```

## Windows desktop prerequisites

Use a supported Windows version and install the tools required by Tauri 2, including:

- Microsoft C++ Build Tools / Visual Studio C++ desktop workload;
- Microsoft Edge WebView2 where it is not already provided by the OS;
- Rust stable with the MSVC toolchain.

Then:

```powershell
rustup default stable-msvc
npm run tauri:dev
```

## macOS desktop prerequisites

Install Xcode command-line tools:

```bash
xcode-select --install
```

Install Rust stable, then:

```bash
npm run tauri:dev
```

Release signing/notarization is a separate process and requires credentials that must never be committed.

## Linux desktop prerequisites

The exact package names vary by distribution. On Ubuntu/Debian development machines, Tauri commonly needs WebKitGTK and related native libraries. CI uses:

```bash
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

Then:

```bash
npm run tauri:dev
```

For another distribution, follow the official Tauri prerequisite guide and install the equivalent packages from that distribution.

## Verify toolchains

```bash
node --version
npm --version
rustc --version
cargo --version
```

Then run:

```bash
npm run build
npm run test

cd src-tauri
cargo test
```

## Environment variables

DiceLab does not require production API keys for its core workflows. See `.env.example` for the intentionally minimal configuration surface.

Never place secrets in `VITE_*` variables: Vite frontend variables are bundled into client assets.

## Editor recommendations

Any editor is supported. Useful capabilities include:

- TypeScript language service;
- ESLint integration;
- Prettier integration;
- rust-analyzer;
- rustfmt on save.

Repository `.editorconfig` settings should remain authoritative for basic whitespace behavior.

## Next steps

- Read [`development.md`](development.md) for project conventions.
- Read [`testing.md`](testing.md) before changing domain logic.
- Read [`architecture.md`](architecture.md) before moving responsibilities between layers.
- Read [`release.md`](release.md) before producing distributable builds.
