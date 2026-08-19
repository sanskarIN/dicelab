# ADR-0004: Stable validation error codes are the localization contract

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

DiceLab validates dice expressions, probability requests, and imported backups at domain/service boundaries. Early UI code could display `Error.message` directly. That is convenient for an English-only prototype but creates several long-term problems:

- English wording becomes an accidental behavioral contract.
- A future translation layer would have to parse or replace exception prose.
- Unknown/native thrown strings could be surfaced to users even when they contain implementation details.
- Dynamic constraints such as min/max/limit values would have to be recovered from formatted text.

DiceLab already has a typed locale catalog, so validation meaning needs a stable non-prose boundary.

## Decision

Expected parser, probability, and backup validation errors expose:

1. a stable machine-readable code;
2. a small immutable context object containing only values needed to explain the constraint;
3. a developer-oriented exception message that is **not** the presentation contract.

The localization layer maps codes/context to user-facing catalog messages in `src/i18n/errors.ts`.

React/application code must not parse exception text to identify expected validation failures. Unknown or native failures use a safe localized fallback.

Current error families include:

- `DiceExpressionError`;
- `ProbabilityComplexityError`;
- `BackupValidationError`.

## Consequences

### Positive

- English wording can change without changing domain behavior.
- Future locales can translate validation feedback directly.
- Dynamic constraints remain typed values rather than text-parsing problems.
- Unknown errors do not automatically leak arbitrary exception prose into UI.
- Tests can pin semantic codes independently of sentence wording.

### Costs

- New validation categories require a new code plus localization mapping/tests.
- Code/context compatibility needs deliberate review.
- The developer message and localized copy can drift if tests/documentation are neglected.

## Rules

- Codes should describe semantics, not implementation details.
- Context should contain only bounded primitive values needed for localization.
- Do not put expressions, backup contents, seeds, personal data, or arbitrary user text into error context.
- Every new code requires domain/service tests.
- Every user-facing code requires localization mapping tests.
- Unknown/unrecognized errors return a generic localized fallback.
- Do not remove or repurpose an existing code casually; treat semantic changes as compatibility-sensitive.

## Alternatives considered

### Translate raw `Error.message`

Rejected because it makes English prose a hidden API and requires brittle string matching.

### Return pre-localized strings from domain code

Rejected because pure domain/native boundaries should not depend on the selected UI locale.

### One generic error for every validation failure

Rejected because it removes actionable correction guidance and weakens accessibility/UX.

## Follow-up

A second locale should implement the complete catalog and verify representative parser/probability/backup mappings before language selection is exposed.
