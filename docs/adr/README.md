# Architecture Decision Records

Architecture Decision Records (ADRs) preserve decisions that affect DiceLab's long-term structure, security, data model, or platform behavior.

## Status values

- **Proposed** — under discussion.
- **Accepted** — current project direction.
- **Superseded** — replaced by a later ADR.
- **Deprecated** — retained for history but should not guide new work.

## Records

- [ADR-0001: Use a modular monolith with Tauri and a React web companion](0001-modular-monolith.md)
- [ADR-0002: Separate secure and deterministic randomness modes](0002-randomness-modes.md)
- [ADR-0003: Use versioned local storage before introducing a database](0003-local-persistence.md)

New ADRs should describe context, decision, consequences, alternatives, and follow-up constraints. Do not rewrite accepted history to make earlier decisions look different; supersede it explicitly when direction changes.
