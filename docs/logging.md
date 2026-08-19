# Structured Logging

DiceLab is offline-first and does not need telemetry to function. Logging exists only to make local development, test failures, and recoverable runtime degradation easier to diagnose without exposing user-controlled content.

## Principles

- Log events, not arbitrary prose dumps.
- Keep event names stable and machine-readable.
- Prefer bounded metadata such as component/surface, operation, key class, mode, or validation code.
- Never log roll history, dice expressions, configured seeds, backup contents, preset names/content, email addresses, authentication material, filesystem payloads, or exported user data.
- Never serialize raw `Error.message`, `Error.stack`, or unknown thrown values into logs.
- Do not add remote telemetry, analytics, crash upload, or log shipping without a separate privacy/security design review and explicit documentation.

## Implementation

`src/services/logger.ts` provides the application logging boundary:

```ts
logger.warn('storage.read_failed', {
  storageArea: 'local',
  keyClass: 'settings',
});
```

A safe record contains:

- canonical ISO timestamp;
- level (`debug`, `info`, `warn`, `error`);
- normalized event name;
- optional redacted/bounded context object.

The logger writes one structured object to the corresponding console method. Production behavior does not depend on logs being available.

## Redaction

Sensitive key names are replaced with `[redacted]`, including key families such as:

- passwords/passphrases;
- tokens/secrets/authorization/cookies/sessions;
- deterministic seeds;
- email/name fields;
- user content/expressions/history/presets/backups/files/payloads/bodies;
- message/stack fields.

Nested objects are redacted recursively. Arrays, strings, and nesting depth are bounded so a log event cannot accidentally become an unbounded user-data dump.

When an `Error` object is supplied as context, only its error type/name is retained. Its message and stack are omitted.

## Current operational events

Current structured events include:

| Event | Level | Safe context |
| --- | --- | --- |
| `ui.recovery_boundary_activated` | error | application surface only |
| `storage.read_failed` | warn | storage area + logical key class |
| `storage.write_failed` | warn | storage area + logical key class |
| `storage.clear_failed` | warn | storage area only |

Do not log normal dice rolls. Normal product behavior should remain quiet.

## Validation and import failures

User-correctable parser, probability, and backup validation failures are represented with stable error codes and localized UI messages. They are not automatically logged because invalid user input is normal product behavior, not an operational incident.

If future diagnostics need counts of failure classes, log only the stable code and operation—not the original expression, backup, file name, seed, or exception prose.

## Testing

`src/services/logger.test.ts` verifies:

- recursive sensitive-key redaction;
- omission of raw error messages/stacks;
- array/string/depth bounds;
- structured console emission.

Storage and recovery-boundary tests additionally verify that thrown private details do not appear in emitted records.

## Review checklist for new logs

Before adding a log event:

1. Can the problem be handled without a log?
2. Is the event name stable and useful?
3. Is every context field necessary to diagnose the operation?
4. Could any field contain user-created text, personal data, a seed, token, path, backup, or export content?
5. Does the logger's key-name redaction protect it even if a caller makes a mistake?
6. Is there a regression test for any new sensitive context shape?
7. Does `PRIVACY.md` still accurately describe data handling?

If the answer to privacy questions is uncertain, do not log the field.
