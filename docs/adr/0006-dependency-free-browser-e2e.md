# ADR-0006: Production web smoke uses Node 22 plus Chromium DevTools Protocol

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

DiceLab needs real-browser evidence for workflows that jsdom cannot fully prove:

- actual browser downloads;
- local-storage persistence across reload;
- browser keyboard/focus behavior;
- real file-input backup restore;
- the production Vite bundle running in Chromium.

The repository did not already contain Playwright, Puppeteer, or a Vitest browser dependency. Adding a large automation package only for a compact smoke flow would increase lockfile/supply-chain weight and required a network-enabled dependency installation that was not available during the hardening pass.

Node.js 22 provides a built-in WebSocket client, and Chromium exposes the DevTools Protocol.

## Decision

Use a small dependency-free browser smoke runner:

- `scripts/e2e-browser.mjs` owns the DiceLab journey and process/download/profile lifecycle.
- `scripts/cdp-session.mjs` owns the minimal DevTools command/event transport.
- `scripts/cdp-session.test.mjs` uses Node's built-in test runner to verify the transport without a browser.
- `npm run test:e2e:infra` runs the CDP transport tests plus browser-runner syntax check.
- `npm run test:e2e` runs against a previously built production `dist/` and a Chromium-compatible browser.

CI and tagged release web verification run the real-browser smoke after `npm run build`.

## Covered workflow

The smoke intentionally focuses on high-value cross-layer behavior:

- first-run onboarding;
- expression entry and roll;
- History visibility;
- real CSV download/content;
- reload persistence;
- command-palette keyboard focus/dismissal;
- exact probability result;
- real backup download;
- two-step local-data clearing;
- real file-input backup restoration;
- restored History visibility.

## Consequences

### Positive

- Real browser coverage without a new npm dependency.
- Production bundle is exercised, not only source/jsdom modules.
- Download and file-input APIs are tested for real.
- The CDP transport is small and independently testable.
- Browser/network policy failures are surfaced through `Page.navigate.errorText` rather than becoming misleading app timeouts.

### Costs

- The project owns a small CDP client/runner.
- This is a smoke suite, not a full cross-browser automation framework.
- Browser binary discovery and hosted-runner availability remain environment dependencies.
- Advanced accessibility/trace/video features from mature automation frameworks are not included.

## Environment behavior

The runner finds Chrome/Chromium from `CHROME_BIN` or common OS paths. On Linux CI it uses `--no-sandbox` because hosted containers often require it.

The August 19, 2026 development execution container can launch Chromium but administrator policy blocks loopback navigation (`net::ERR_BLOCKED_BY_ADMINISTRATOR`). That environment cannot provide full E2E pass evidence. The runner must remain strict; security policy should not be weakened merely to produce a local green result.

## Rules

- Build the production bundle before E2E.
- Keep the journey focused on cross-layer behavior; lower-level variants belong in unit/component/domain tests.
- Never silently ignore browser navigation/network errors.
- Keep profile/download data isolated in temporary directories and clean it after runs.
- Do not add a browser automation dependency by hand-editing `package-lock.json`.
- If requirements outgrow this runner, add a mature framework through normal dependency management and supersede this ADR explicitly.

## Alternatives considered

### Playwright/Puppeteer immediately

Deferred, not rejected forever. The current scope does not justify the dependency/lockfile change under the available tooling environment.

### jsdom only

Rejected because jsdom cannot prove real download, reload-persistence, Chromium focus, or file-input behavior in the production bundle.

### Manual browser testing only

Rejected because primary cross-layer workflows should be repeatable in CI before release packaging.
