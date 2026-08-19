# Repository policy gates

DiceLab uses small dependency-free audits to keep architectural and security rules executable rather than relying only on prose review.

These audits are intentionally separate from normal TypeScript/Rust unit tests. They inspect repository structure and configuration that can remain syntactically valid while still widening a trust boundary.

## Current gates

| Policy | Command | Protects |
| --- | --- | --- |
| Desktop capabilities | `node scripts/check-capabilities.mjs` | Prevents broad filesystem/shell/HTTP/process, wildcard-window, and remote-origin capability expansion |
| Tauri security config | `node scripts/check-tauri-security.mjs` | Protects CSP and remote-domain IPC configuration |
| Localized formatting | `node scripts/check-localized-formatting.mjs` | Keeps locale-sensitive UI values behind `src/i18n/format.ts` |
| Native runtime boundary | `node scripts/check-runtime-boundaries.mjs` | Keeps Tauri core access/runtime detection in approved service adapters |
| Native command contract | `node scripts/check-native-command-contract.mjs` | Keeps frontend command invocations and Rust handler allowlist synchronized |
| Aggregate boundary audit | `node scripts/check-policy-boundaries.mjs` | Runs the first four committed policy audits as one status surface |

The native command contract currently has its own dedicated workflow/status because it was introduced after the first aggregate boundary set. A future maintenance pass may fold it into the aggregate script after preserving test coverage and status-transition documentation.

## Self-tests

Every policy auditor has synthetic tests that prove it rejects the unsafe condition it claims to reject.

Run:

```bash
node --test scripts/check-capabilities.test.mjs scripts/check-capabilities.integration.test.mjs
node --test scripts/check-tauri-security.test.mjs scripts/check-tauri-security.integration.test.mjs
node --test scripts/check-localized-formatting.test.mjs scripts/check-localized-formatting.integration.test.mjs
node --test scripts/check-runtime-boundaries.test.mjs scripts/check-runtime-boundaries.integration.test.mjs
node --test scripts/check-native-command-contract.test.mjs scripts/check-native-command-contract.integration.test.mjs
node --test scripts/check-policy-boundaries.integration.test.mjs
```

Integration regressions evaluate the actual committed repository rather than only synthetic fixtures.

## CI workflows

Current dedicated/aggregate workflows include:

- `.github/workflows/capability-audit.yml`
- `.github/workflows/tauri-security-audit.yml`
- `.github/workflows/localized-formatting-audit.yml`
- `.github/workflows/runtime-boundary-audit.yml`
- `.github/workflows/native-command-contract.yml`
- `.github/workflows/repository-policy-audit.yml`
- `.github/workflows/release-policy-audits.yml`

The release-tag policy workflow rechecks the original aggregate boundary set on version tags. The native-command workflow also includes version-tag execution.

## Branch protection

Do not guess required status-check names from workflow YAML. GitHub branch protection should use the exact check names observed after successful workflow runs on the repository.

Recommended sequence:

1. merge/configure the workflow;
2. observe at least one successful run;
3. copy the exact emitted status/check name;
4. add that observed name to branch protection;
5. verify a test pull request is blocked when the check fails.

This avoids accidentally making the branch impossible to update because of a misspelled or never-emitted required status name.

## Policy changes

A policy audit should not be weakened merely to make a new feature pass.

When a legitimate feature conflicts with an audit:

1. identify the actual user/product need;
2. look for a narrower design first;
3. document the trust-boundary change;
4. add an ADR when the decision is durable/security-relevant;
5. update tests to prove both newly allowed and still-denied behavior;
6. change the auditor and implementation together;
7. perform packaged-platform smoke review where native behavior is involved.

## Relationship to normal quality checks

Policy gates complement:

- formatting/linting;
- TypeScript type checking;
- Vitest unit/component/integration tests;
- real-browser E2E;
- Rust format/test/Clippy;
- parser fuzzing;
- secret scanning;
- version synchronization;
- CodeQL/dependency review;
- release artifact/provenance/checksum verification.

No single layer proves release readiness.

## Evidence rule

A workflow file existing in the repository proves only that the check is configured. It does not prove the check ran or passed on a release candidate.

Record real candidate evidence using [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md).

## Related documentation

- [`capability-policy.md`](capability-policy.md)
- [`tauri-security-policy.md`](tauri-security-policy.md)
- [`runtime-boundary-policy.md`](runtime-boundary-policy.md)
- [`native-command-contract.md`](native-command-contract.md)
- [`native-exports.md`](native-exports.md)
- [`architecture.md`](architecture.md)
- [`testing.md`](testing.md)
- [`release.md`](release.md)
- [`../SECURITY.md`](../SECURITY.md)
