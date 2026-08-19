# Real-Browser End-to-End Testing

DiceLab includes a dependency-free browser smoke runner built on Node.js 22 and the Chromium DevTools Protocol (CDP). It tests the production web build in an actual Chromium-compatible browser without adding Playwright/Puppeteer packages or modifying the npm lockfile for a browser automation framework.

## Commands

First build the production web companion:

```bash
npm ci
npm run build
```

Run the fast test-harness checks:

```bash
npm run test:e2e:infra
```

Then run the real-browser journey:

```bash
npm run test:e2e
```

`test:e2e:infra` uses Node's built-in test runner for the CDP transport and `node --check` for the browser runner. It does not require a browser and should fail quickly if the automation infrastructure itself is broken.

`test:e2e` requires `dist/index.html` from `npm run build` and a Chromium-compatible browser.

## Browser discovery

The runner searches these sources in order:

1. `CHROME_BIN` environment variable;
2. common Linux Chrome/Chromium paths;
3. common macOS Chrome/Chromium application paths;
4. common Windows Chrome installation paths.

If no compatible browser is found, the command fails with an explicit instruction to set `CHROME_BIN`.

On Linux CI, the runner adds Chromium's `--no-sandbox` flag because hosted containers commonly require it. Normal local runs do not disable the browser sandbox automatically.

## Production preview

The runner starts the existing Vite preview command on:

```text
http://127.0.0.1:4173
```

The preview port is strict. If another process already owns that port, the test fails instead of silently testing an unexpected server.

The browser uses an isolated temporary profile and temporary download directory. Both are deleted after the run.

## Covered journey

The browser smoke currently verifies all of the following against the production build:

1. First-run onboarding is visible and can be completed.
2. The Dice Studio accepts the real React input `2d6+1`.
3. The Roll button becomes enabled and a real roll result appears.
4. History shows the rolled expression.
5. CSV export creates an actual browser download and the file contains the rolled expression.
6. Browser reload preserves onboarding completion and roll history through local storage.
7. `Ctrl+K` opens the command palette.
8. Command search receives focus.
9. Escape closes the command palette.
10. Probability calculation for `2d6` reports expected value `7.000`.
11. Backup export creates a real JSON browser download.
12. The backup has schema version `1` and contains the roll history.
13. The two-step Clear local data action resets history and onboarding state.
14. The exported backup is selected through the real file input using CDP's file-input API.
15. Backup restore reports success and restores the original roll history.

This complements, rather than replaces, Vitest/Testing Library integration tests. Unit/integration tests remain faster and more diagnostic; the browser smoke proves the production bundle and browser APIs work together.

## CDP transport tests

`scripts/cdp-session.mjs` owns the small DevTools protocol client used by the browser runner.

`scripts/cdp-session.test.mjs` verifies, without launching a browser:

- command IDs and response routing;
- protocol error rejection;
- event waiter resolution;
- event timeouts and cleanup;
- pending command/event rejection when the WebSocket closes.

Keeping this transport isolated prevents a browser-environment problem from hiding a basic automation-client defect.

## Navigation synchronization

The runner synchronizes navigation/reload on `Page.loadEventFired` and then verifies `document.readyState === 'complete'`.

It also checks `Page.navigate.errorText`. A browser network/policy failure is therefore reported explicitly instead of being mistaken for an application timeout.

## Current local-container limitation

The development execution container used during the August 19, 2026 hardening pass has Node.js 22 and Chromium installed, but Chromium navigation to the loopback preview server returns:

```text
net::ERR_BLOCKED_BY_ADMINISTRATOR
```

The same server is reachable through Node's HTTP client, so this is a browser policy restriction in that execution environment. The full DiceLab journey therefore has **not** been marked locally passing from that container.

The CDP transport/self-tests were independently executed there and passed. The full browser journey must be observed on GitHub Actions or another browser environment that permits loopback navigation before it counts as release evidence.

Do not disable security policies merely to turn this environmental block into a local pass.

## CI and release behavior

Normal CI runs:

1. secret-audit self-test;
2. repository secret audit;
3. E2E infrastructure self-test;
4. locked dependency installation;
5. documentation/format/lint/unit/integration checks;
6. production build;
7. real-browser E2E smoke.

Tagged release web verification runs the same browser checks before uploading the web artifact. A failing E2E smoke blocks the release workflow from producing a successful web prerequisite for the draft release.

## Debugging failures

When `npm run test:e2e` fails:

- read the named E2E step printed immediately before the failure;
- confirm `dist/index.html` was built from the current commit;
- confirm the preview port is available;
- confirm `CHROME_BIN` points to a Chromium-compatible executable if auto-discovery fails;
- inspect `Page.navigate` errors before treating a timeout as an application bug;
- reproduce the same user workflow manually in the built web companion;
- add a lower-level regression test when the defect belongs to domain/component logic.

The runner intentionally does not log DiceLab backup contents, roll values beyond the fixed test expression, browser profile contents, or other user data.

## Scope limits

The browser smoke currently targets the Vite web companion. Native Tauri packaging and OS integration still require separate Windows/macOS/Linux artifact smoke tests.

The E2E runner is intentionally small. Add scenarios only when they protect a high-value cross-layer workflow; do not turn it into a second unit-test suite.
