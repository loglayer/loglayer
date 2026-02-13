# Development Workflow

## Package Manager

This project uses **pnpm** with **Turborepo**.

```bash
pnpm install              # Install dependencies
pnpm run <script>         # Run package-level scripts
turbo build               # Build all packages
turbo test                # Run all tests
turbo test --filter <pkg> # Run tests for specific package
turbo build --force       # Force re-run (bypass cache)
```

## Internal Dependencies

Use `workspace:*` for internal package references:

```json
{
  "dependencies": {
    "@loglayer/transport-http": "workspace:*"
  }
}
```

Run `pnpm install` after adding workspace dependencies.

## New Package Versioning

Set initial version to `0.0.1` in `package.json`. Changesets will handle bumping to `1.0.0` on first release.

## Verification

After ANY code changes, run the full validation suite:

```bash
# For type changes (interfaces, types, core packages)
turbo build && turbo verify-types && turbo test

# For implementation changes only
turbo verify-types && turbo test

# For single package
pnpm run test && turbo verify-types
```

Never skip these steps. Even small changes can have cascading effects in a monorepo.

## Commit Convention

Use [commitlint conventional](https://www.conventionalcommits.org/) format:

```
type(scope): description
```

Allowed types: `feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `ci`, `test`, `revert`, `perf`

Examples:
- `feat: add datadog HTTP metrics mixin`
- `fix(transport): handle null logger gracefully`

## Rules

- **ALWAYS** write tests for any code changes
- **ALWAYS** run tests after writing them
- **ALWAYS** run `turbo build && turbo verify-types && turbo test` after code changes
- **ALWAYS** run `turbo build` after type changes before making further changes
- **ALWAYS** use `workspace:*` for internal dependencies
- **ALWAYS** preserve existing code patterns and conventions
- **Do NOT** modify changelog files (auto-generated)
- **Do NOT** commit with `--no-verify` unless explicitly requested
- **Do NOT** skip writing tests
- **Do NOT** skip test/type verification steps
