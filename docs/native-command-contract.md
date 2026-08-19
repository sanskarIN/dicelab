# Native command contract

DiceLab exposes a very small application-specific Tauri command surface. The frontend and Rust handler must stay synchronized and intentionally reviewed.

## Approved commands

| Command | Frontend adapter | Purpose |
| --- | --- | --- |
| `roll_expression` | `src/services/roll-service.ts` | Validate and execute a native secure or deterministic dice roll |
| `save_text_export` | `src/services/export.ts` | Open the native save dialog and write a bounded CSV/JSON export |

Production React components and unrelated services do not invoke Tauri commands directly.

## Auditor

Run:

```bash
node scripts/check-native-command-contract.mjs
```

The audit checks production TypeScript plus `src-tauri/src/lib.rs` and rejects:

- frontend invocation of an unknown native command;
- an approved command invoked from the wrong frontend adapter;
- dynamic/non-literal command names;
- Rust handler commands outside the reviewed allowlist;
- missing approved Rust handler commands;
- duplicate native handler entries.

This complements, rather than replaces, the broader runtime-boundary and capability audits.

## Self-tests

```bash
node --test scripts/check-native-command-contract.test.mjs
node --test scripts/check-native-command-contract.integration.test.mjs
```

The integration regression audits the actual committed frontend and Rust command surface.

## CI

`.github/workflows/native-command-contract.yml` runs the self-tests and committed-source audit for relevant source changes, pull requests, manual dispatches, and release tags.

Do not add a required branch-protection status name until an actual successful workflow run has been observed.

## Adding a native command

A new command is an architecture and security boundary change, not merely a new string in `generate_handler!`.

Before adding one:

1. define the user-facing operation and browser behavior where applicable;
2. decide whether a native command is actually necessary;
3. validate all renderer-controlled input in Rust;
4. return bounded, serializable output;
5. avoid accepting arbitrary private paths or command strings when a narrower native interaction is possible;
6. add a focused frontend service adapter;
7. add Rust and frontend routing/validation regressions;
8. review capabilities, CSP, logging/redaction, localization, and error handling;
9. update the command allowlist in the auditor only in the same reviewed change;
10. add or update an ADR if the command creates a durable new trust boundary.

## Related policy

- [`runtime-boundary-policy.md`](runtime-boundary-policy.md)
- [`capability-policy.md`](capability-policy.md)
- [`tauri-security-policy.md`](tauri-security-policy.md)
- [`native-exports.md`](native-exports.md)
- [`adr/native-export-boundary.md`](adr/native-export-boundary.md)
- [`architecture.md`](architecture.md)
- [`../SECURITY.md`](../SECURITY.md)
