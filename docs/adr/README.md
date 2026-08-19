# Architecture Decision Records

Architecture Decision Records (ADRs) preserve decisions that affect DiceLab's long-term structure, security, data model, platform behavior, or verification strategy.

## Status values

- **Proposed** — under discussion.
- **Accepted** — current project direction.
- **Superseded** — replaced by a later ADR.
- **Deprecated** — retained for history but should not guide new work.

## Records

| Record | Decision area |
| --- | --- |
| [ADR-0001: Use a modular monolith with Tauri and a React web companion](0001-modular-monolith.md) | Overall application/module architecture |
| [ADR-0002: Separate secure and deterministic randomness modes](0002-randomness-modes.md) | Randomness security, reproducibility, and runtime parity |
| [ADR-0003: Use versioned local storage before introducing a database](0003-local-persistence.md) | Offline persistence and migration strategy |
| [ADR-0004: Stable error codes are the localization contract](0004-stable-error-localization-contract.md) | Domain error semantics versus translated presentation copy |
| [ADR-0005: Keep diagnostics local and privacy-safe](0005-privacy-safe-local-logging.md) | Structured logging, redaction, and telemetry avoidance |
| [ADR-0006: Use a dependency-free browser E2E client for the current smoke scope](0006-dependency-free-browser-e2e.md) | Production-bundle real-browser verification |
| [Native export boundary](native-export-boundary.md) | Dedicated Rust save command instead of broad renderer filesystem permission |

## Adding an ADR

Create an ADR when a change establishes a durable trade-off rather than merely describing implementation detail. A useful ADR should include:

1. **Context** — the product/engineering problem and constraints.
2. **Decision** — the chosen approach in precise terms.
3. **Consequences** — benefits, costs, operational implications, and compatibility impact.
4. **Alternatives considered** — plausible rejected options and why they were not chosen.
5. **Verification/follow-up constraints** — tests, security checks, migrations, platform review, or documentation that must remain true.

Prefer the next numeric filename for new general decisions. Existing historical filenames should not be renamed only for cosmetic numbering consistency because other documentation may already link to them.

Do not rewrite an accepted ADR to make history look different. When direction changes materially, add a new ADR and mark the older one superseded.
