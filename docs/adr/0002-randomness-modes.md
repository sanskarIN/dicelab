# ADR-0002: Separate secure and deterministic randomness modes

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

DiceLab needs trustworthy ordinary dice rolls and reproducible sequences for tests, demonstrations, and debugging. These goals require different random-number properties and should not be blurred into one mode.

## Decision

Expose two explicit modes:

1. **Secure** — the default user-facing mode.
   - Desktop: operating-system-backed randomness through Rust `OsRng`.
   - Web companion: Web Crypto with rejection sampling for bounded integers.
2. **Seeded** — deterministic mode for reproducibility.
   - The configured seed is combined with a local sequence number per roll.
   - The deterministic algorithms are not described as cryptographically secure.

Both runtimes validate expression bounds before generating results.

## Consequences

### Positive

- Security properties are clear to users and maintainers.
- Tests can reproduce roll sequences.
- Secure mode avoids predictable pseudo-random seeds.
- Web bounded-integer generation avoids simple modulo bias.

### Costs

- Native and browser implementations must be tested independently.
- A seed does not guarantee an identical sequence across different runtime implementations.
- UI copy must continue to distinguish secure and deterministic behavior.

## Alternatives considered

### One seeded PRNG everywhere

Rejected because predictable output would be inappropriate for a mode advertised as secure/random for normal use.

### One cryptographic generator with no seed support

Rejected because it makes deterministic tests and demonstrations unnecessarily difficult.

### Custom cryptography

Rejected. DiceLab relies on maintained platform/library random facilities rather than inventing a cryptographic primitive.

## Follow-up rules

- Never silently downgrade secure mode to seeded mode.
- Never use `Math.random()` for dice values in secure mode.
- Changes to random algorithms require regression tests and release notes.
- Seeded mode may change only with explicit compatibility documentation.
