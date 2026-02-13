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

Add package to the appropriate list file:
- `context-manager-list.md`, `plugin-list.md`, `transport-list.md`, `mixin-list.md`

Add to sidebar config: `docs/.vitepress/config.mts`

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
