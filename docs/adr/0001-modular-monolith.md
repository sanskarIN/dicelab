# ADR-0001: Use a modular monolith with Tauri and a React web companion

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

DiceLab targets Windows, macOS, Linux, and a web companion. The product is offline-first and its core workflows do not require a server. Most complexity is domain logic, local persistence, probability calculation, and native secure randomness rather than distributed-system coordination.

## Decision

Use a modular monolith:

- React + TypeScript for the shared UI and browser companion;
- Rust + Tauri for the desktop shell and native trust boundary;
- explicit `domain`, `services`, and `components` frontend layers;
- a small Tauri command surface instead of a local HTTP service;
- no microservices or remote backend for core DiceLab operation.

## Consequences

### Positive

- Most UI behavior is shared across desktop and web.
- Desktop distribution retains a small native security boundary.
- Domain code stays independently testable.
- Offline behavior is straightforward.
- There is no account/server infrastructure to operate for ordinary use.

### Costs

- Some validation exists in both TypeScript and Rust to protect each boundary.
- Native and browser randomness implementations are separate.
- Desktop packaging still requires platform-specific CI/toolchains.

## Alternatives considered

### Full Rust UI

Rejected for the initial architecture because it would reduce web-companion reuse and make the product UI iteration path less direct.

### Electron

Rejected because DiceLab needs a relatively small native boundary and Tauri provides a suitable Rust integration without bundling a separate Chromium runtime as the product architecture choice.

### Hosted backend

Rejected because it would conflict with the offline-first mission and add privacy, authentication, availability, and operational complexity with little value for core dice workflows.

### Microservices

Rejected because there are no independent scaling/deployment domains that justify distributed-system complexity.

## Follow-up rules

A future backend, database service, or separate native service requires a new ADR that identifies the user benefit, privacy implications, offline behavior, migration path, and operational cost.
