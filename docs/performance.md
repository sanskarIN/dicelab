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

Changing the history filter resets the visible window to 200 matching rows. The user can reveal additional rows in 200-entry increments. Export actions operate on all matching records, not just currently rendered records.

If product requirements grow materially beyond 5,000 entries, benchmark the full search/statistics pipeline and consider true list virtualization or indexed persistence before raising the cap.

## Automated performance-related behavior

Regression tests verify that:

- a 220-entry history initially mounts 200 roll rows;
- requesting more reveals the remaining entries;
- summary statistics still report the full matching set;
- changing a filter resets the visible window;
- exact probability calculations reject unsafe numeric ranges rather than silently losing exactness.

These checks protect performance-oriented behavior, but they are not wall-clock benchmarks.

## Benchmark roadmap

Before 1.0, add repeatable executable benchmarks for:

- TypeScript expression parsing;
- seeded and secure roll throughput;
- ordinary probability dynamic programming;
- keep/drop enumeration near the allowed limit;
- 5,000-row history filtering and statistics;
- progressive history rendering in a real browser;
- Rust expression parsing and native roll throughput.

Record machine/runtime versions with benchmark results so comparisons remain meaningful. Avoid brittle CI timing thresholds until runner variance is understood.

## Profiling rules

- Measure before optimizing.
- Prefer algorithmic improvements over micro-optimizations.
- Avoid memoization without a clear invalidation rule.
- Do not trade correctness or secure randomness for speed.
- Re-check accessibility after performance-driven rendering changes.
- Treat bundle-size growth as a dependency review signal.
