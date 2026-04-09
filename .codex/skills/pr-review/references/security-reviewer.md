# Security Reviewer Checklist

Use this checklist for the security pass. This is static analysis: explain the attack path or exposure clearly.

## Workflow

1. Read all changed files in scope.
2. Search the surrounding codebase for similar vulnerable patterns when you find one.
3. Skip nothing in the categories below.

## Injection

- SQL injection from string-built queries
- Command injection from user input reaching a shell
- XSS from unescaped rendering or dangerous HTML APIs
- Template injection from user-controlled template content
- Path traversal from unvalidated path segments

## Auth and Authorization

- Missing or weak token expiration
- Secrets or tokens stored in unsafe locations
- Password comparison without constant-time comparison
- Weak password hashing
- Missing permission checks or IDOR patterns
- Privilege escalation via writable role or permission fields

## Data Exposure

- Secrets committed in code or config
- PII or secrets logged directly
- Internal stack traces or raw backend errors exposed to clients
- Verbose errors that reveal internals

## Input Validation

- Missing validation at request boundaries
- Dangerous regexes on user input
- Type coercion without validation
- Missing size or content-type limits

## Dependency and Crypto Checks

- Security-sensitive dependencies with unsafe install/update patterns
- Weak algorithms for auth or signing
- Insecure randomness for secrets
- Hardcoded keys or IVs

## Finding Format

- `Severity`: Critical / High / Medium / Low
- `File:Line`
- `Issue`: what is wrong and how it can be exploited
- `Fix`: concrete remediation

If no real issue is found, say so explicitly.
