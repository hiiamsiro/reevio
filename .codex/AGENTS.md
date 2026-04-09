# Personal AGENTS.md

## Code Style

- Comments in English only
- Prefer functional programming over OOP
- Use OOP classes only for connectors and interfaces to external systems
- Write pure functions - only modify return values, never input parameters or global state
- Follow DRY, KISS, and YAGNI principles
- Use strict typing everywhere - function returns, variables, collections
- Check if logic already exists before writing new code
- Avoid untyped variables and generic types
- Never use default parameter values - make all parameters explicit
- Create proper type definitions for complex data structures
- All imports at the top of the file
- Write simple single-purpose functions - no multi-mode behavior, no flag parameters that switch logic

## Error Handling

- Always raise errors explicitly, never silently ignore them
- Use specific error types that clearly indicate what went wrong
- Avoid catch-all exception handlers that hide the root cause
- Error messages should be clear and actionable
- No fallbacks unless I explicitly ask for them
- Fix root causes, not symptoms
- External API or service calls: use retries with warnings, then raise the last error
- Error messages must include enough context to debug: request params, response body, status codes
- Logging should use structured fields instead of interpolating dynamic values into message strings

## Tooling and Dependencies

- Prefer modern package management files like `pyproject.toml` and `package.json`
- Install dependencies in project environments, not globally
- Add dependencies to project config files, not as one-off manual installs
- Read installed dependency source code when needed instead of guessing behavior

## Testing

- Respect the current repository testing strategy and existing test suite
- Do not add new unit tests by default
- When tests are needed, prefer integration, end-to-end, or smoke tests that validate real behavior
- Use unit tests only rarely, mainly for stable datasets or pure data transformations
- Never add unit tests just to increase coverage numbers
- Avoid mocks when real calls are practical
- It is usually better to spend a little money on real API or service calls than to maintain fragile mock-based coverage
- Add only the minimum test coverage needed for the requested change

## Codex Workflow

- Inspect the repository before editing
- Read active `AGENTS.md` files before making assumptions
- Keep changes minimal and directly related to the current request
- Match the existing repository style even when it differs from my personal preference
- Do not revert unrelated changes
- Prefer `rg` for code search
- Use non-interactive commands with flags
- Always use non-interactive git diff: `git --no-pager diff` or `git diff | cat`
- Run relevant tests or validation commands after code changes when the project already defines them

## Documentation

- Code is the primary documentation - use clear naming, types, and docstrings
- Keep documentation in docstrings of the functions or classes they describe, not in separate files
- Separate docs files only when a concept cannot be expressed clearly in code
- Never duplicate documentation across files
- Store knowledge as current state, not as a changelog of modifications

## Project Rules Synced from `.claude/rules`

### General Code Quality

- Functions do one thing. If a block needs a section comment, extract it.
- No magic values - extract numbers, strings, and config to named constants.
- Handle errors at the boundary. Do not catch and rethrow unless you add useful context.
- No premature abstractions. Prefer a few repeated lines over a helper used once.
- Do not add extra features or "improvements" beyond the request.
- No dead code or commented-out blocks.
- Prefer composition over inheritance.
- File naming: PascalCase for components/classes, kebab-case for utilities and directories.
- Boolean names use `is` / `has` / `should` / `can`.
- Function names are verb-first like `getUser`, `validateEmail`, `handleSubmit`.
- Handlers use `handle*` internally and `on*` for props.
- Factories use `create*`, converters use `to*`, predicates use `is*` / `has*`.
- Constants use `SCREAMING_SNAKE_CASE`.
- Only use common abbreviations like `id`, `url`, `api`, `db`, `config`, `auth`.
- Comments explain why, not what.
- Use code markers consistently: `TODO(author): desc (#issue)`, `FIXME(author): desc (#issue)`, `HACK(author): desc (#issue)`, `NOTE: desc`.
- Do not commit placeholder markers like `XXX`, `TEMP`, or `REMOVEME`.
- Organize imports in groups: builtins, external, internal, relative, then types.
- Prefer named exports over default exports.
- Keep public functions first, then private helpers in call order.

### Testing Rules

- Write tests that verify behavior, not implementation details.
- Run the most specific relevant test file after changes instead of the full suite when possible.
- If a test is flaky, fix it or remove it. Never rely on retries to pass.
- Prefer real implementations over mocks. Mock only at clear system boundaries like network, filesystem, or clock.
- Keep tests simple with Arrange-Act-Assert structure and no branching logic.
- Test names should describe behavior clearly.
- Avoid meaningless assertions like `expect(true)`.

### Database Migration Rules

Apply these rules to migration-related paths such as `**/migrations/**`, `**/migrate/**`, `**/db/migrate/**`, `**/alembic/**`, `**/prisma/migrations/**`, `**/drizzle/**`, `**/knex/migrations/**`, `**/sequelize/migrations/**`, `**/typeorm/migrations/**`, `**/flyway/**`, and `**/liquibase/**`.

- Never modify an existing migration. Create a new migration for every change.
- Every migration must be reversible with forward and rollback paths.
- Test migrations in both directions before committing.
- New migration filenames must preserve timestamp ordering and go at the end.
- Prefer ORM or migration-tool primitives over raw SQL when available.
- Never seed production data inside migration files.
- Never drop tables or columns without confirming the data is no longer needed.
- Add indexes in separate migrations instead of bundling them with schema changes.

### Backend Error Handling Rules

Apply these rules to `apps/api/src/**/*.ts`, `apps/worker/src/**/*.ts`, and `packages/**/src/**/*.ts`.

- Use typed or custom error classes with error codes instead of generic `Error`.
- Never swallow errors silently. Log them or rethrow with context.
- Handle every rejected promise. No floating async calls.
- HTTP error responses should use a consistent shape and correct status codes.
- Never expose stack traces, internal paths, or raw database errors in production responses.
- Retry transient failures with exponential backoff.
- Fail fast on validation and auth errors instead of retrying.
- Include correlation or request IDs in error logs when available.

### Frontend Rules

Apply these rules to frontend paths such as `apps/web/**/*.tsx`, `apps/web/**/*.jsx`, `apps/web/**/*.css`, `apps/web/**/*.scss`, `apps/web/**/components/**`, `apps/web/**/app/**`, `apps/web/**/lib/**`, and `apps/web/**/styles/**`.

- Before writing frontend code, find the project's existing design tokens file. If none exists, create one.
- Never hardcode raw design values in components.
- Keep token categories for colors, spacing, radius, shadows, typography, breakpoints, transitions, and z-index.
- Choose one primary design principle and apply it consistently.
- Use the component and styling framework already present in the project. Do not mix competing UI stacks.
- Use CSS Grid for 2D layouts, Flexbox for 1D layouts, and prefer `gap` over margin hacks.
- Use semantic HTML elements.
- Build mobile-first and keep touch targets at least `44x44px`.
- Accessibility is mandatory: keyboard support, correct labels, meaningful alt text, visible focus states, sufficient contrast, and no color-only indicators.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Use lazy loading for below-the-fold images and specify image dimensions.
- Use `font-display: swap`.
- Prefer `transform` and `opacity` for animations.
- Virtualize large lists at 100+ items.
- Do not import an entire library for a single function.

### Security Rules

Apply these rules to `apps/api/src/**/*.ts` and `packages/**/src/**/*.ts`.

- Validate all user input at the system boundary.
- Use parameterized queries. Never concatenate user input into SQL or shell commands.
- Sanitize output to prevent XSS using framework-provided escaping.
- Authentication tokens must be short-lived. Keep refresh tokens server-side only.
- Never log secrets, tokens, passwords, or PII.
- Use constant-time comparison for secrets and tokens.
- Set appropriate CORS, CSP, and other security headers.
- Rate-limit authentication endpoints.
