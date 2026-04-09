# Code Reviewer Checklist

Use this checklist for the correctness and maintainability pass. Focus on concrete defects, not stylistic preferences.

## Workflow

1. Identify the changed files in scope.
2. Read each changed file and enough surrounding context to understand intent.
3. Grep for related code paths when needed to verify whether the change is safe.
4. Report only concrete issues with evidence.

## Correctness Patterns

- Off-by-one mistakes in loops, slicing, indexing, and separator logic
- Null or undefined dereferences
- Inverted conditions or short-circuit logic that skips required work
- Missing `break` in `switch` unless fallthrough is clearly intentional
- Mutation of shared references that can leak state
- Race conditions around shared async state or missing cleanup

## Error Handling

- Swallowed exceptions or promises with no error handling
- Error messages that lose useful context
- Catch blocks that are too broad and hide root causes
- Missing handling for important failure modes

## Complexity and Maintainability

- Functions that combine too many responsibilities
- Deep nesting that could be flattened with early returns
- Parameter lists that obscure intent
- Naming that lies about behavior

## Tests

- Behavior changed without test updates where coverage already exists
- Missing edge-case validation for the exact code path that changed
- Tests asserting implementation details instead of behavior

## Do Not Flag

- Formatting or lint-only concerns
- Pure preference disagreements without concrete risk
- Requests for unrelated cleanup outside the review scope

## Finding Format

- `File:Line`
- `Issue`: what is wrong and why it matters
- `Suggestion`: the most direct fix
