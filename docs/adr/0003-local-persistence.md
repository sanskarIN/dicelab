# ADR-0003: Use versioned local storage before introducing a database

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

DiceLab currently persists small, device-local collections: roll history, custom presets, preferences, and onboarding state. The product caps retained history and does not require relational queries, synchronization, authentication, or server-side persistence.

## Decision

Use versioned browser/webview local-storage keys for the current product scope and a versioned JSON backup format for portability.

Current keys use a `.v1` suffix so an incompatible future schema can migrate deliberately instead of silently reinterpreting old data.

## Consequences

### Positive

- No database dependency or migration runtime is needed for the initial product.
- Offline behavior is natural.
- Users can clear application state easily.
- Backup/restore remains explicit and understandable.

### Costs

- Local storage is not suitable for unlimited history or complex relational queries.
- The application must handle quota/storage blocking gracefully.
- Data is device-local unless the user exports a backup.

## Alternatives considered

### SQLite immediately

Rejected for the current scope because it would add native plugin permissions, schema migration machinery, platform testing, and binary complexity without a demonstrated product need.

### Remote database

Rejected because core DiceLab workflows do not need accounts or network availability.

### IndexedDB

Deferred. It could support larger browser datasets, but current bounded history does not justify additional asynchronous persistence complexity.

## Follow-up rules

Introduce a database only after measuring a concrete need, such as significantly larger history, richer querying, or transactional multi-entity workflows. A database migration requires a new ADR and an explicit import/migration path for existing `.v1` local data and backup files.
