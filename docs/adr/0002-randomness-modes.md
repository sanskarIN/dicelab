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
   - Both the TypeScript web implementation and Rust desktop implementation use the same UTF-8 FNV-1a 32-bit seed hash and xorshift32 sequence algorithm.
   - Bounded integer conversion is defined identically in both runtimes, so the same effective seed and dice expression produce the same deterministic sequence.
   - Fixed reference vectors are tested in both TypeScript and Rust to prevent accidental cross-runtime drift.
   - The deterministic algorithm is not cryptographically secure and must never be presented as secure randomness.

Both runtimes validate expression bounds before generating results.

## Consequences

### Positive

- Security properties are clear to users and maintainers.
- Tests can reproduce roll sequences across web and desktop runtimes.
- Bug reports can include an effective seed that maintainers can replay regardless of runtime.
- Secure mode avoids predictable pseudo-random seeds.
- Web bounded-integer generation avoids simple modulo bias.

### Costs

- Native and browser implementations must be tested independently and against shared reference vectors.
- Seeded algorithm changes become compatibility changes and require explicit release notes.
- UI copy must continue to distinguish secure and deterministic behavior.

## Alternatives considered

### Different deterministic algorithms per runtime

Rejected because runtime-specific sequences reduce the value of seeded mode for portable tests, demonstrations, and bug reproduction.

### One seeded PRNG everywhere

Rejected for secure mode because predictable output would be inappropriate for ordinary rolls advertised as secure randomness.

### One cryptographic generator with no seed support

Rejected because it makes deterministic tests and demonstrations unnecessarily difficult.

### Custom cryptography

Rejected. DiceLab relies on maintained platform/library random facilities for secure mode. The small deterministic algorithm exists only for explicitly non-secure reproducibility.

## Follow-up rules

- Never silently downgrade secure mode to seeded mode.
- Never use `Math.random()` for dice values in secure mode.
- Keep TypeScript and Rust seeded reference vectors synchronized.
- Changes to random algorithms require regression tests and release notes.
- Seeded mode may change only with explicit compatibility documentation and a planned version boundary.
