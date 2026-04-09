---
name: pr-review
description: Review a pull request, staged diff, unstaged diff, or specific file with a Claude-style PR review workflow. Use when Codex needs structured review coverage for PR quality, correctness, security, performance, documentation, and missing tests, especially when the user asks for PR review or wants the .claude pr-review behavior mirrored in Codex.
---

# Pr Review

Mirror the repository's `.claude/skills/pr-review` workflow as closely as Codex allows.

Keep the review focused on real issues: bugs, regressions, vulnerabilities, measurable performance risks, inaccurate docs, and missing tests. Do not spend time on lint-level style nits.

## Scope Detection

Resolve the review target from the user's request before analyzing code:

- If the user passes a PR number like `123` or `#123`, treat it as a PR review.
- If the user passes `staged`, review `git diff --cached`. If that is empty, fall back to `git diff`.
- If the user passes a file path, review that file's current state and surrounding context.
- If the user passes no argument, try `gh pr view` for the current branch. If a PR exists, use the PR path. Otherwise fall back to `git diff --cached`, then `git diff`.

If there is nothing to review, say so and stop.

## PR Quality Pass

Skip this section for staged or file-only reviews.

For PR reviews, gather:

- PR title, body, author, base branch, and head branch
- Full diff with `gh pr diff`
- CI status with `gh pr checks`
- Review comments with `gh api repos/{owner}/{repo}/pulls/$NUMBER/comments`

Review the PR itself before the code:

- Title: descriptive and under 72 characters
- Description: explains why, not just what
- Test plan: present and specific
- Size: flag PRs over roughly 500 changed lines as candidates for splitting
- Base branch: confirm it targets the expected branch
- CI: report passing, failing, or pending checks
- Unresolved comments: list open review threads with file and line when available

## Review Passes

Run review passes based on diff content, not only file names.

Always run a correctness pass.

Run a security pass when the change touches auth, request/input handling, tokens, sessions, permissions, queries, file paths, uploads, shell execution, secrets, or boundary validation.

Run a performance pass when the change touches endpoints, heavy loops, data fetching, database queries, caching, background jobs, connection handling, large collections, rendering hot paths, or bundle-sensitive frontend code. Skip this pass for changes that are only docs, static assets, or trivial config.

Run a documentation pass when `.md` files, docstrings, JSDoc, comments with behavioral guidance, onboarding docs, or API docs changed.

## Delegation Strategy

Preserve the Claude-style specialist workflow when allowed.

- If the user explicitly asks for parallel or delegated review, or explicitly asks to mirror the `.claude` workflow, prefer parallel specialist passes with subagents.
- If delegation is not appropriate or not available, run the same passes sequentially yourself and keep the same report structure.

When delegating:

- Spawn one agent for correctness using the checklist in `references/code-reviewer.md`.
- Spawn one agent for security using the checklist in `references/security-reviewer.md` when the security pass is needed.
- Spawn one agent for performance using the checklist in `references/performance-reviewer.md` when the performance pass is needed.
- Spawn one agent for documentation using `references/doc-reviewer.md` when the documentation pass is needed.
- Pass only the task-local scope, diff, and relevant files. Do not ask agents to edit code.
- Wait for the delegated results only when you need them to synthesize the final report.

When not delegating:

- Perform the same passes yourself by opening the corresponding reference file and applying its rubric directly.

## Report Format

Present findings first, ordered by severity. Include file and line references whenever possible.

For PR reviews, use this structure:

```md
## PR Review: #[number] - [title]

**Author**: [author] | **Base**: [base] -> **Head**: [head] | **Changed**: [N files, +X/-Y lines]

### PR Quality
- Title: [ok / needs improvement]
- Description: [ok / missing why / missing test plan / empty]
- Size: [ok / large - consider splitting]
- CI: [passing / failing / pending - details]
- Unresolved comments: [none / list]

### Code Review
#### Critical / High
- [Pass or agent] File:Line - issue

#### Medium
- [Pass or agent] File:Line - issue

#### Low
- [Pass or agent] File:Line - issue

### Passed
- [areas checked with no issues]

### Verdict
[Ready to merge / Needs changes - summarize blockers]
```

For staged or file reviews, use this structure:

```md
## Review Summary

**Scope**: [staged changes / unstaged changes / file path]
**Passes run**: [correctness, security, performance, docs]

### Critical / High
- [Pass or agent] File:Line - issue

### Medium / Low
- [Pass or agent] File:Line - issue

### Passed
- [areas checked with no issues]
```

Deduplicate overlapping findings and attribute each one to the pass or agent that surfaced it most clearly.

## References

Load only the reference files required for the passes you run:

- `references/code-reviewer.md`
- `references/security-reviewer.md`
- `references/performance-reviewer.md`
- `references/doc-reviewer.md`
