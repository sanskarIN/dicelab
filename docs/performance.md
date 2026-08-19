# Performance

DiceLab is intentionally local and should feel immediate on ordinary desktop hardware and modern browsers.

## Current safeguards

- Dice expression counts and side counts are bounded.
- History retention is capped at 5,000 entries.
- History rows are rendered progressively: at most 200 matching entries are mounted initially, with explicit 200-row increments on demand.
- History statistics, histograms, search, and exports continue to use the complete filtered data set rather than only the visible window.
- Probability dynamic-programming work has an explicit state-size budget.
- Exact ordinary-sum probability calculation rejects raw outcome counts above JavaScript safe-integer precision.
- Keep/drop probability enumeration has an explicit raw-outcome limit.
- Probability rendering caps visible rows so a mathematically large distribution does not create an equally large DOM tree.
- No network request is required to roll dice.
- No artificial loading delay is used.
- The UI avoids large image/video assets and third-party runtime trackers.

## Initial budgets

These are engineering targets, not guarantees for every device:

| Workflow | Target |
| --- | --- |
| Single ordinary dice roll | perceptually immediate; no intentional delay |
| Parse/validate common expression | under one animation frame on ordinary hardware |
| Render normal roll result | under one animation frame after result is available |
| Search 5,000 local history rows | interactive without visible multi-second blocking |
| Initial large-history DOM | no more than 200 matching roll rows before user requests more |
| Common probability expression such as `2d6` | perceptually immediate |
| Manageable keep/drop probability such as `4d6kh3` | short interactive calculation without freezing the app |
| Initial web bundle | keep dependencies small; investigate material growth during release review |

## Probability complexity

Exact probability calculation can grow exponentially for keep/drop pools. DiceLab therefore refuses calculations above an interactive safety limit rather than blocking the main thread indefinitely or pretending an approximation is exact.

Normal sum distributions use dynamic programming, which avoids enumerating every raw outcome. Very large `count × sides` state spaces are still rejected to protect memory and responsiveness. A separate raw-outcome safe-integer guard prevents the UI from labeling floating-point-rounded way counts as exact.

## History scaling

DiceLab retains at most 5,000 history entries. Search/statistics intentionally process that bounded in-memory collection, while row rendering is progressive so a large retained history does not immediately create thousands of DOM nodes.

History filtering lives in `src/domain/history.ts` so UI behavior, unit coverage, and the 5,000-record benchmark exercise the same query implementation. Changing the history filter resets the visible window to 200 matching rows. The user can reveal additional rows in 200-entry increments. Export actions operate on all matching records, not just currently rendered records.

If product requirements grow materially beyond 5,000 entries, benchmark the full search/statistics pipeline and consider true list virtualization or indexed persistence before raising the cap.

## Executable benchmark suite

Run the existing lockfile-backed Vitest benchmark suite with:

```bash
npm run bench
```

Current benchmark modules cover:

- representative TypeScript dice-expression parsing;
- ordinary probability dynamic programming (`2d6`, `10d6+5`);
- exact keep/drop enumeration (`4d6kh3`, `2d20kh1`);
- summarizing the maximum retained 5,000-roll history;
- filtering 5,000 rolls by expression and total;
- copying the unfiltered 5,000-roll history path.

Benchmarks deliberately report measurements rather than enforcing hard CI timing thresholds. Hosted runners, CPU power policy, browser/runtime versions, thermal state, and background load can produce noisy wall-clock numbers.

When recording benchmark evidence for a release candidate, record at minimum:

- commit SHA;
- operating system and CPU model;
- Node.js and npm versions;
- DiceLab/Vitest versions from the lockfile;
- whether the run used battery or AC power where that matters;
- benchmark command and complete output;
- any material environment differences from the previous recorded run.

Do not compare benchmark values across materially different machines as if they were a regression test.

## Automated performance-related behavior

Regression tests verify that:

- a 220-entry history initially mounts 200 roll rows;
- requesting more reveals the remaining entries;
- summary statistics still report the full matching set;
- changing a filter resets the visible window;
- history domain filtering preserves order and handles expression/total queries;
- exact probability calculations reject unsafe numeric ranges rather than silently losing exactness.

These checks protect performance-oriented behavior separately from wall-clock measurement.

## Remaining benchmark work

Before 1.0 release evidence is considered complete, add or record appropriate measurements for:

- seeded and secure roll throughput;
- progressive history rendering in a real browser;
- Rust expression parsing and native roll throughput;
- release bundle size on each supported desktop target.

The first two may use the existing application/toolchain; Rust native benchmarking should avoid adding a heavyweight benchmark dependency merely for vanity metrics. Real-browser rendering and release bundle measurements require the corresponding environment/artifacts.

## Profiling rules

- Measure before optimizing.
- Prefer algorithmic improvements over micro-optimizations.
- Avoid memoization without a clear invalidation rule.
- Do not trade correctness or secure randomness for speed.
- Re-check accessibility after performance-driven rendering changes.
- Treat bundle-size growth as a dependency review signal.
