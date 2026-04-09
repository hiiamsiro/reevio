# Performance Reviewer Checklist

Use this checklist for the performance pass. Flag only issues likely to cause measurable impact.

## Workflow

1. Read the changed files and the hot paths they affect.
2. Estimate frequency: per request, per render, per job, startup-only, or rare admin path.
3. Rank findings by impact: frequency times cost.

## Database and Fetching

- N+1 queries
- Missing indexes on columns used for filtering, joins, or sorting
- `SELECT *` or over-fetching when only a subset is needed
- Unbounded list queries or missing pagination
- Transactions kept open during slow I/O

## Memory and Lifecycle

- Event listeners, subscriptions, intervals, or timers without cleanup
- Unbounded caches or maps
- Large datasets loaded into memory unnecessarily
- Streams, handles, or connections not closed

## Computation and Concurrency

- Expensive repeated work inside loops
- Blocking synchronous work on hot paths
- Sequential awaits that should be parallel
- Shared mutable state or missing pooling in concurrent code

## Frontend

- Large images without lazy loading or sizing
- Large library imports for one small utility
- Re-render churn on hot paths
- Layout thrashing or paint-heavy animations
- Render-blocking resources on critical pages

## Do Not Flag

- Micro-optimizations with no measurable outcome
- Rare code paths with negligible cost
- Speculative improvements with no clear impact

## Finding Format

- `Impact`: High / Medium / Low with a brief why
- `File:Line`
- `Issue`: what is slow and where the cost comes from
- `Fix`: the concrete change that removes the bottleneck
