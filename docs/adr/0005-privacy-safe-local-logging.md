# ADR-0005: Diagnostics are local structured events with mandatory redaction

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

DiceLab is offline-first and does not require analytics, telemetry, or a remote crash service. Some operational failures are still useful to diagnose locally—for example blocked browser storage or activation of the application recovery boundary.

Arbitrary `console.*` calls are risky because context can accidentally include:

- deterministic seeds;
- dice expressions or roll history;
- preset/backup contents;
- email/name fields;
- credentials/tokens;
- raw exception messages/stacks.

The project therefore needs a diagnostic boundary that preserves privacy by construction.

## Decision

Application diagnostics use `src/services/logger.ts`.

Each event contains:

- canonical timestamp;
- log level;
- normalized stable event name;
- optional bounded context.

The logger recursively redacts sensitive key families and bounds strings, arrays, and nesting depth. `Error` values retain only an error type/name; raw message/stack data is omitted.

Normal dice rolls and user-correctable validation failures are not logged by default.

No remote log upload, analytics, crash reporting, or telemetry is introduced by this decision.

## Consequences

### Positive

- Operational failures can be diagnosed without dumping user-created content.
- The same privacy rules apply across call sites.
- Tests can verify redaction and bounded context.
- The offline-first privacy model remains intact.

### Costs

- Diagnostic detail is intentionally limited.
- New context fields require privacy review.
- Developers must route product diagnostics through the logger instead of ad-hoc console statements.

## Rules

- Event names must be stable and machine-readable.
- Context fields must be minimal and operationally necessary.
- Never intentionally log credentials, seeds, expressions, history, presets, backup/file contents, personal data, arbitrary messages, or stacks.
- Do not pass raw unknown thrown values to logging context unless the logger's redaction behavior is explicitly tested for that shape.
- Validation failures caused by normal user input are not operational incidents.
- Any future remote telemetry requires a new ADR, privacy-policy change, user-facing disclosure, and explicit review.

## Current events

- `ui.recovery_boundary_activated`
- `storage.read_failed`
- `storage.write_failed`
- `storage.clear_failed`

## Alternatives considered

### Raw console logging at call sites

Rejected because privacy behavior would depend on every caller remembering redaction rules.

### Remote telemetry/crash collection

Rejected for the current product because it is unnecessary for core operation and conflicts with the minimal-data/offline-first posture without additional consent/design work.

### No logging at all

Rejected because bounded local operational events are useful for debugging degraded browser/runtime behavior.

## Follow-up

Review `docs/logging.md` and logger regression tests whenever a new diagnostic event or context field is introduced.
