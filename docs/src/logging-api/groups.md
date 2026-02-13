---
title: Groups in LogLayer
description: Learn how to use groups to route logs to specific transports with per-group log levels
---

# Groups

Groups are named routing rules that give you fine-grained control over which logs go to which transports. In a large system with many subsystems (database, auth, payments, etc.), groups let you "listen" to only certain categories of logs instead of adjusting global log levels.

::: tip Attribution
The concept of groups is inspired by [categories in LogTape](https://logtape.org/manual/categories).
:::

## Configuration

Define groups when creating a LogLayer instance:

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: [
    new ConsoleTransport({ id: 'console', logger: console }),
    new DatadogTransport({ id: 'datadog', logger: datadog }),
    new SentryTransport({ id: 'sentry', logger: sentry }),
  ],
  groups: {
    database: {
      transports: ['datadog'],
      level: 'error',
    },
    auth: {
      transports: ['sentry', 'datadog'],
      level: 'warn',
    },
  },
})
```

### Group Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `transports` | `string[]` | (required) | Array of transport IDs that this group routes to |
| `level` | `LogLevelType` | `"trace"` | Minimum log level for this group. Logs below this level are dropped. |
| `enabled` | `boolean` | `true` | Whether this group is active |

### LogLayer Config Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `groups` | `Record<string, LogGroupConfig>` | `undefined` | Named routing groups |
| `activeGroups` | `string[] \| null` | `null` | When set, only these groups are active. The `LOGLAYER_GROUPS` env variable overrides this. |
| `ungrouped` | `'all' \| 'none' \| string[]` | `'all'` | Controls what happens to logs with no group tags |

## Per-Log Tagging

Tag individual log entries with one or more groups using `withGroup()` on the builder chain:

```typescript
log.withGroup('database').error('Connection timeout')

// Combine with metadata and errors
log.withMetadata({ query: 'SELECT *' }).withGroup('database').error('Query failed')
log.withError(new Error('timeout')).withGroup('database').error('Connection lost')

// Multiple groups — log goes to the union of both groups' transports
log.withGroup(['database', 'auth']).error('Auth DB connection failed')
```

## Persistent Tagging (Child Loggers)

Use `withGroup()` on a LogLayer instance to create a child logger with groups permanently assigned. All logs from that child are tagged with the group.

```typescript
const dbLogger = log.withGroup('database')

dbLogger.error('Pool exhausted')  // routed through 'database' group
dbLogger.info('Connected')         // also routed through 'database' group

// Pass to libraries that accept a logger
const db = createDbClient({ logger: log.withGroup('database') })
```

Groups are additive across child loggers:

```typescript
const authDbLogger = log.withGroup('auth').withGroup('database')
authDbLogger.error('Auth DB failure')  // routes to both auth + database transports
```

::: info
`withGroup()` on a LogLayer instance creates a child logger (like `withPrefix()`). The parent logger is not affected.
:::

## Group Level Filtering

Each group can have its own minimum log level. Logs below the group's level are dropped for that group's transports:

```typescript
const log = new LogLayer({
  transport: [
    new ConsoleTransport({ id: 'console', logger: console }),
    new DatadogTransport({ id: 'datadog', logger: datadog }),
  ],
  groups: {
    database: { transports: ['datadog'], level: 'error' },
  },
})

log.withGroup('database').info('Query took 50ms')  // dropped (below error)
log.withGroup('database').error('Connection lost')   // sent to datadog
```

## Ungrouped Logs

The `ungrouped` config controls what happens to logs that have no group tag:

```typescript
// Default: ungrouped logs go to ALL transports (backward compatible)
{ ungrouped: 'all' }

// Drop ungrouped logs entirely
{ ungrouped: 'none' }

// Send ungrouped logs only to specific transports
{ ungrouped: ['console'] }
```

::: tip
The default `'all'` ensures full backward compatibility — if you add groups to an existing setup, your ungrouped logs continue working as before.
:::

## Active Groups Filter

Use `activeGroups` to restrict which groups are active. Logs tagged with inactive groups are dropped:

```typescript
const log = new LogLayer({
  transport: [...],
  groups: {
    database: { transports: ['datadog'], level: 'error' },
    auth: { transports: ['sentry'], level: 'warn' },
    payments: { transports: ['datadog'], level: 'info' },
  },
  activeGroups: ['database'],  // only database group is active
})
```

### Environment Variable

The `LOGLAYER_GROUPS` environment variable overrides the `activeGroups` config at construction time:

```bash
# Only these groups are active
LOGLAYER_GROUPS=database,auth

# With level overrides
LOGLAYER_GROUPS=database:debug,auth:warn
```

This is useful for debugging — narrow focus to a specific subsystem without code changes.

## Runtime Management

Manage groups dynamically after construction:

```typescript
// Add a new group
log.addGroup('inbox', { transports: ['datadog'], level: 'error' })

// Remove a group
log.removeGroup('inbox')

// Enable/disable a group
log.disableGroup('database')
log.enableGroup('database')

// Change a group's level
log.setGroupLevel('database', 'debug')

// Set active groups filter
log.setActiveGroups(['database'])   // only database is active
log.setActiveGroups(null)           // clear filter, all groups active

// Get all group configs
log.getGroups()  // { database: { ... }, auth: { ... } }
```

## Routing Precedence

When a grouped log is processed, filters are checked in this order:

1. **Group enabled** — is `group.enabled !== false`?
2. **Active groups filter** — is the group in `activeGroups` (if set)?
3. **Group level** — does the log level meet the group's minimum?
4. **Transport membership** — is the transport in the group's `transports` list?
5. **Transport level** — does the log level meet the transport's own minimum?
6. **`shouldSendToLogger` plugin** — does the plugin allow it?

If a log is tagged with a group that doesn't exist in the config, it falls through to ungrouped rules.
