# DiceLab — Current Work Handoff

Last updated: **2026-08-25**

Current release-preparation target: **2.0.14** (`v2.0.14`)

The intermediate 2.0.13 candidate was not published. Its completed implementation is carried forward into 2.0.14. This file is the current continuation entry point and intentionally distinguishes source/configuration work from evidence that still has to be observed on the exact final release candidate.

## Historical handoffs

Detailed earlier milestones remain preserved in:

1. [`docs/handoffs/2026-08-19-pre-native-exports.md`](docs/handoffs/2026-08-19-pre-native-exports.md)
2. [`docs/handoffs/2026-08-19-native-localization.md`](docs/handoffs/2026-08-19-native-localization.md)
3. [`docs/handoffs/2026-08-19-policy-hardening.md`](docs/handoffs/2026-08-19-policy-hardening.md)
4. [`docs/handoffs/2026-08-19-documentation-completion.md`](docs/handoffs/2026-08-19-documentation-completion.md)

The handoff index is [`docs/handoffs/README.md`](docs/handoffs/README.md).

---

## 2026-08-25 — 2.0.14 continuation

### Why this candidate advanced

Repository state at the start of this continuation showed a prepared 2.0.13 source candidate but no published 2.0.13 release/tag. The next product-level roadmap gap selected for implementation was richer exact probability comparison visualization, so the active preparation target advanced to 2.0.14 rather than publishing an intermediate candidate without completing its evidence gate.

### Exact A/B distribution overlay

New domain module `src/domain/probability-overlay.ts` aligns two already-validated exact probability distributions across the union of their totals in linear time.

For every total it exposes:

- A probability;
- B probability;
- signed `A - B` probability delta;
- overall maximum probability for normalized presentation;
- maximum absolute delta for downstream analysis.

The implementation does not introduce approximation. It consumes only distributions produced by the existing guarded exact calculator.

`ProbabilityPanel` now includes a per-total comparison overlay below the existing aggregate `P(A > B)`, `P(A = B)`, and `P(A < B)` meter. Each visible total shows normalized A/B bars and a signed percentage-point delta. Rendering is capped at 120 comparison totals so supported wide distributions do not create an unbounded comparison surface.

### English/Hindi and responsive presentation

New typed localization boundary `src/i18n/probability-overlay.ts` contains English/Hindi:

- overlay heading;
- screen-reader comparison description;
- bounded-rendering/truncation copy.

New `src/probability-overlay.css` owns responsive dual-bar layout, scrolling, signed-delta alignment, and narrow-screen rules. `src/main.tsx` loads it between shared and mobile-specific styles.

### Overlay regression coverage

New and expanded tests cover:

- overlapping exact distributions;
- identical distributions and zero deltas;
- shifted/non-overlapping distributions without dropping totals;
- English accessible overlay description;
- normalized per-total bar widths;
- signed probability-point deltas;
- Hindi overlay presentation;
- preservation of the existing aggregate comparison behavior and invalid-expression recovery.

Representative commits:

- `03b5dc0c` — `feat(probability): align exact comparison distributions`
- `a8ce12b4` — `test(probability): cover exact distribution overlays`
- `4aee1641` — `feat(probability): render exact A/B distribution overlay`
- `08a7c2d5` — `i18n(probability): add typed overlay copy`
- `6ebe0529` — `fix(probability): route overlay copy through locale boundary`
- `cac64561` — `ui(probability): style exact distribution overlay`
- `707ce269` — `build(ui): load probability overlay styles`
- `35fc9e58` — `test(probability): verify exact overlay visualization`

### Repository-audit repairs discovered by CI

The continuation used GitHub Actions as an executable release gate rather than assuming committed audit scripts were healthy.

The first repository-audit failure exposed a stale documentation-link checker contract: `scripts/check-doc-links.test.mjs` imported `extractDocumentationTargets`, but the implementation no longer exported it. The checker was repaired so the CLI and tests share reusable exported target extraction, Markdown-heading anchor recognition, and repository scanning logic.

A follow-up correction replaced a non-portable regular-expression character-class intersection in the heading slugger with portable Unicode-aware syntax.

After that repair, the audit reached the exhaustive repository inventory and correctly rejected the four newly tracked overlay files until all four were documented in `docs/repository-file-reference.md`. The inventory was updated rather than weakening the gate.

Representative commits:

- `efa87c6a` — `fix(audit): restore documentation link checker contract`
- `70a0f2f1` — `fix(audit): use portable heading slug syntax`
- `7f49df0e` — `docs(inventory): register 2.0.14 probability overlay files`

### Repository invariant evidence observed

After the audit repairs and inventory synchronization, the repository-audit workflow progressed successfully through the relevant invariant steps for that source state, including:

- secret-scanner self-test and audit;
- documentation-link self-test;
- local documentation link/anchor audit;
- exhaustive tracked-file inventory self-test and audit;
- browser E2E infrastructure self-test/syntax check;
- PWA policy self-test and audit;
- application-version auditor self-test/consistency check for that pre-bump state;
- release-package verifier self-test.

This evidence proves those invariant gates for the audited source state. It does not replace full 2.0.14 final-candidate CI/native/device evidence after subsequent commits.

### 2.0.14 source version preparation

Authoritative source metadata is now set to 2.0.14 in:

- `package.json`;
- `src/config/app.ts`;
- `src-tauri/Cargo.toml`;
- `src-tauri/tauri.conf.json`.

Granular version commits:

- `790673e7` — `chore(version): prepare frontend 2.0.14`
- `3b0d9f1a` — `chore(version): prepare Tauri 2.0.14`
- `36564b7a` — `chore(version): prepare npm 2.0.14`
- `b4cd40c7` — `chore(version): prepare Rust 2.0.14`

The generated npm/Cargo lock application metadata still requires the repository lockfile workflow to regenerate and commit 2.0.14 metadata. Do not hand-edit the generated dependency graph to bypass that workflow.

### Rust formatting gate repaired

The first full 2.0.14 CI attempt reached Rust quality and exposed formatting drift in `src-tauri/src/lib.rs` under the current stable `rustfmt`. No native behavior change was required. The file was reformatted exactly to the CI formatter's expected layout.

- `fe5df7de` — `style(rust): apply current stable rustfmt`

The final candidate still needs a later CI run on the exact final commit to prove Rust formatting, tests, and Clippy together are green.

### Release documentation synchronized

Current candidate documentation now includes:

- [`ROADMAP.md`](ROADMAP.md) — 2.0.14 target, completed overlay work, and remaining evidence gates;
- [`CHANGELOG.md`](CHANGELOG.md) — 2.0.14 candidate notes and explicit unpublished status;
- [`docs/release-blockers-current.md`](docs/release-blockers-current.md) — exact 2.0.14 blocker/evidence ledger;
- [`docs/repository-file-reference.md`](docs/repository-file-reference.md) — exhaustive new overlay file ownership;
- this handoff.

Representative commits:

- `c66151c9` — `docs(roadmap): advance candidate to 2.0.14`
- `ef0b3e35` — `docs(changelog): prepare 2.0.14 candidate notes`
- `3ae0e15c` — `docs(release): advance blockers to 2.0.14`

---

## Carried forward from the unpublished 2.0.13 candidate

The 2.0.14 candidate also includes the completed 2.0.13 source work:

- expression-level history aggregation by normalized expression;
- History usage share, average, range, latest activity, and deterministic ranking;
- responsive History expression analytics;
- accessible aggregate A/B probability comparison meter;
- normalized-content duplicate-safe/idempotent shared preset imports;
- domain/component/integration regressions for those behaviors;
- real-browser E2E assertions for history analytics and aggregate exact probability comparison.

Those capabilities remain part of 2.0.14 because 2.0.13 was not published.

---

## Cross-platform source baseline carried forward

DiceLab's shared source/configuration currently targets:

| Platform | Target state |
| --- | --- |
| Windows | Tauri 2 desktop target implemented |
| macOS | Tauri 2 desktop target implemented |
| Linux | Tauri 2 desktop target implemented |
| Android | Tauri 2 mobile target implemented, API 24+ |
| iOS/iPadOS | Tauri 2 mobile target implemented, iOS/iPadOS 14.0+ |
| Modern browsers / ChromeOS | React/Vite installable offline PWA implemented |

Native export remains behind the narrow Rust `save_text_export` command and operating-system chooser. Android `content://` and iOS security-scoped selections stay behind Tauri/native abstractions; no broad renderer filesystem capability is granted.

Browser PWA service-worker registration remains production-only and excluded from Tauri runtimes.

---

## Remaining 2.0.14 candidate work

Continue release preparation in this order:

1. observe the lockfile workflow regenerate and commit npm/Cargo application metadata at 2.0.14;
2. observe full normal CI green on one exact final commit: web quality/build/real-browser E2E, Rust fmt/test/Clippy, Android build, and iOS simulator build;
3. run/observe the bounded Rust parser fuzz campaign for the final candidate;
4. record candidate benchmark output with source commit/hardware/OS/Node/npm details;
5. build and smoke Windows/macOS/Linux release candidates;
6. run physical Android smoke including system document-provider export and orientation/safe-area/touch behavior;
7. run physical iPhone/iPad smoke including Files-picker export, security-scope lifecycle, safe areas, orientation, and persistence;
8. verify installed production PWA/offline behavior on representative browser/device environments;
9. complete keyboard/touch/screen-reader/200%-text/reduced-motion English/Hindi review, including History analytics and both aggregate/per-total probability comparison surfaces;
10. review CodeQL/dependencies/repository security settings and all policy gates on the final commit;
11. capture real candidate screenshots from verified builds;
12. record actual signing/notarization/Play Store/App Store readiness without overstating unsigned validation artifacts;
13. create the draft release only from the verified commit;
14. verify every ZIP, `SHA256SUMS.txt`, and `RELEASE-METADATA.json` entry against the exact source/tag/workflow;
15. fill [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md);
16. publish `v2.0.14` only after explicit maintainer **APPROVE**.

---

## Important continuation rules

- Keep exact probability insights/comparisons/overlays downstream of `src/domain/probability.ts`; do not silently substitute approximate calculations for advertised exact results.
- Keep the renderer capability narrow; native filesystem/plugin usage does not justify broad renderer filesystem permissions.
- Keep Android document-provider URIs and iOS security-scoped files behind native/Tauri abstractions.
- Keep service-worker registration production-browser-only and same-origin/offline-first.
- Preserve pre-read size rejection for imported backup and preset files.
- Keep shared preset files separate from full backup state and continue normalized-content deduplication.
- Keep English/Hindi user-facing changes localized and use shared locale-aware formatting boundaries.
- Keep `policy:test` / `policy:all`, documentation-link audits, exhaustive file inventory, and version/lock checks executable rather than documentation-only promises.
- Regenerate lockfiles through package-manager/automation paths after manifest/version changes; do not hand-edit dependency graphs.
- Treat committed workflows/tests/configuration as implementation, not as proof that a final candidate passed.
- Never commit Android/iOS/store signing credentials or call unsigned validation artifacts store-ready.
- Keep README, changelog, roadmap, blocker ledger, release docs, maintainer references, exhaustive inventory, and this handoff synchronized with actual behavior.

---

## Canonical references

- [`README.md`](README.md)
- [`CHANGELOG.md`](CHANGELOG.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`docs/README.md`](docs/README.md)
- [`docs/setup.md`](docs/setup.md)
- [`docs/web-pwa.md`](docs/web-pwa.md)
- [`docs/native-exports.md`](docs/native-exports.md)
- [`docs/release.md`](docs/release.md)
- [`docs/release-blockers-current.md`](docs/release-blockers-current.md)
- [`docs/release-candidate-evidence-template.md`](docs/release-candidate-evidence-template.md)
- [`docs/automation-reference.md`](docs/automation-reference.md)
- [`docs/repository-file-reference.md`](docs/repository-file-reference.md)
- [`docs/code-reference.md`](docs/code-reference.md)
- [`docs/data-contracts.md`](docs/data-contracts.md)
- [`docs/capability-policy.md`](docs/capability-policy.md)
- [`docs/testing.md`](docs/testing.md)
- [`docs/lockfile-policy.md`](docs/lockfile-policy.md)

**Made by the Sanskar**