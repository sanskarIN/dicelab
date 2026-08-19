# Desktop capability policy

DiceLab keeps the Tauri webview capability surface intentionally narrow. The repository includes a dependency-free policy auditor so changes to `src-tauri/capabilities/*.json` cannot quietly introduce broad high-risk permission families without review.

## Policy goals

The current application does not need the webview to have general access to:

- arbitrary filesystem reads/writes;
- shell command execution;
- arbitrary HTTP client capabilities;
- process-control capabilities;
- remote-origin capability access;
- wildcard window targets.

Native CSV/JSON output is deliberately handled by the purpose-built `save_text_export` Rust command. The webview does not need broad filesystem permissions to support that feature.

## Auditor

Run:

```bash
node scripts/check-capabilities.mjs
```

The auditor reads every JSON file under `src-tauri/capabilities/` and fails if it finds:

- a `remote` capability block;
- no explicit window targets;
- wildcard/invalid window targets;
- malformed permission entries;
- permissions beginning with `fs:`;
- permissions beginning with `shell:`;
- permissions beginning with `http:`;
- permissions beginning with `process:`.

The current main-window capability uses only the narrow core capability baseline required by DiceLab.

## Self-tests

Synthetic policy tests:

```bash
node --test scripts/check-capabilities.test.mjs
```

Repository capability regression:

```bash
node --test scripts/check-capabilities.integration.test.mjs
```

The integration regression invokes the same auditor against the actual committed capability directory.

## CI

`.github/workflows/capability-audit.yml` runs the dependency-free auditor when capability policy files, the auditor, or its core self-test change. It also supports manual dispatch.

The workflow's final audit step always evaluates the actual checked-out capability files, so the committed configuration is checked even independently of the synthetic fixtures.

A configured workflow is not a substitute for release evidence. Required status-check names should only be added to branch protection after a successful run has been observed.

## Adding a capability

Do not work around this policy by obfuscating permission identifiers or weakening the auditor.

If a future DiceLab feature genuinely requires a currently forbidden capability family:

1. write an ADR describing the user need and narrower alternatives considered;
2. identify the minimum Tauri permission(s) required;
3. scope the permission to explicit windows and resources;
4. add tests for expected and denied behavior;
5. update `SECURITY.md`, architecture, and threat-boundary documentation;
6. update this auditor deliberately in the same reviewed change;
7. verify the permission in packaged Windows/macOS/Linux candidates;
8. keep credentials, private paths, and user content out of diagnostic logs.

Broad `default` permissions for a high-risk plugin should not be granted merely for convenience.

## Relationship to native exports

The native export design is intentionally compatible with this policy:

- the renderer passes no output path;
- Rust opens the operating-system save dialog;
- the selected path originates from that dialog;
- Rust validates format, filename, payload size, and final extension;
- native errors returned to the UI omit the private selected path;
- no `fs:` capability is needed in the webview.

See:

- [`native-exports.md`](native-exports.md)
- [`adr/native-export-boundary.md`](adr/native-export-boundary.md)
- [`../SECURITY.md`](../SECURITY.md)
