# Documentation

## README.md

Every package README must include:
1. npm version badge
2. Downloads badge
3. TypeScript badge
4. Simple description with link to https://loglayer.dev
5. Link to corresponding site documentation

Keep READMEs minimal — installation and basic setup only. Reserve deeper details for site documentation.

## Site Documentation

Required elements:
- npm version badge
- Link to source on GitHub
- Install instructions for npm/yarn/pnpm (in a code group)
- Configuration presented as tables
- Use LogLayer methods correctly in code examples

### Adding New Packages

When adding a new package, you must:

1. Add to the appropriate list partial in `docs/src/`:
   - `context-managers/_partials/context-manager-list.md`
   - `plugins/_partials/plugin-list.md`
   - `transports/_partials/transport-list.md`
   - `mixins/_partials/mixin-list.md`
   - `integrations/_partials/integration-list.md`
2. Add to sidebar config: `docs/.vitepress/config.mts`
3. Create a changelog file in the appropriate `changelogs/` directory
4. Update `docs/src/public/llms.txt` and `docs/src/public/llms-full.txt` — these are manually maintained LLM-facing indexes of all documentation pages and must include any new package links

### Configuration Tables

| Name | Type | Default | Description |
|------|------|---------|-------------|

### Custom Containers

```markdown
::: info Title
Info box
:::

::: tip Title
Tip
:::

::: warning Title
Warning
:::

::: danger Title
Dangerous warning. Use for MUST-type instructions.
:::

::: details Title
Collapsible block for optional lengthy information.
:::
```

## What's New

Format in `docs/src/whats-new.md`:

```markdown
## Feb 12, 2026

`package-name`:

- Brief description of change
```

If the date already exists, add to that entry.

## Changelogs

**Do NOT** write changelog entries. Changelogs are auto-generated and must be manually managed by the user.
