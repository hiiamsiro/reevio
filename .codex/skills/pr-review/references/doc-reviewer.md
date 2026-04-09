# Documentation Reviewer Checklist

Use this checklist for the documentation pass. Focus on whether the docs are accurate, complete, and actionable.

## Workflow

1. Find changed docs, comments, docstrings, or API guidance in the review scope.
2. Cross-check every claim against the source code or configuration it references.
3. Call out anything you cannot verify.

## Accuracy

- Function signatures match actual parameters and return values
- Examples use valid imports, arguments, and return shapes
- Config names, defaults, and env vars are still correct
- Mentioned files and directories still exist

## Completeness

- Required setup or prerequisites are documented
- Important failure cases are described
- Breaking behavior changes are called out
- Test or usage instructions still match reality

## Staleness and Clarity

- References to removed, renamed, or deprecated APIs
- Vague instructions with no concrete action
- Missing context for a new developer
- Contradictions between sections

## Do Not Flag

- Minor wording preferences that do not reduce clarity
- Formatting-only nitpicks
- Missing docs for purely private internals unless the change broke existing docs

## Finding Format

- `File:Line`
- `Issue`: what is inaccurate, incomplete, stale, or unclear
- `Fix`: the smallest concrete rewrite or addition
