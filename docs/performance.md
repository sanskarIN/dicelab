# Performance

DiceLab is intentionally local and should feel immediate on ordinary desktop hardware and modern browsers.

## Current safeguards

- Dice expression counts and side counts are bounded.
- History retention is capped at 5,000 entries.
- Probability dynamic-programming work has an explicit state-size budget.
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
| Common probability expression such as `2d6` | perceptually immediate |
| Manageable keep/drop probability such as `4d6kh3` | short interactive calculation without freezing the app |
| Initial web bundle | keep dependencies small; investigate material growth during release review |

## Probability complexity

Exact probability calculation can grow exponentially for keep/drop pools. DiceLab therefore refuses calculations above an interactive safety limit rather than blocking the main thread indefinitely or pretending an approximation is exact.

Normal sum distributions use dynamic programming, which avoids enumerating every raw outcome. Very large `count × sides` state spaces are still rejected to protect memory and responsiveness.

## History scaling

The current history implementation is intentionally capped. If product requirements grow beyond 5,000 retained entries, add list virtualization and benchmark search/filter behavior before raising the cap.

## Benchmark roadmap

Before 1.0, add repeatable benchmarks for:

- TypeScript expression parsing;
- seeded and secure roll throughput;
- ordinary probability dynamic programming;
- keep/drop enumeration near the allowed limit;
- 5,000-row history filtering and statistics;
- Rust expression parsing and native roll throughput.

Record machine/runtime versions with benchmark results so comparisons remain meaningful.

## Profiling rules

- Measure before optimizing.
- Prefer algorithmic improvements over micro-optimizations.
- Avoid memoization without a clear invalidation rule.
- Do not trade correctness or secure randomness for speed.
- Re-check accessibility after performance-driven rendering changes.
- Treat bundle-size growth as a dependency review signal.
