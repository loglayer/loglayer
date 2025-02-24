<script setup>
import { NuAsciinemaPlayer } from '@nolebase/ui-asciinema'
import 'asciinema-player/dist/bundle/asciinema-player.css'
</script>

# Pretty Terminal Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-pretty-terminal)](https://www.npmjs.com/package/@loglayer/transport-pretty-terminal)

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/pretty-terminal)

The Pretty Terminal Transport provides an interactive and visually appealing terminal output for your logs. 
It has interactive browsing, text search, detailed viewing for large logs, and themes.

<NuAsciinemaPlayer
src="/asciinema/pretty-terminal.cast"
:preload="true"
:cols="400"
:rows="20"
:auto-play="true"
:controls="true"
:terminal-font-size="'14px'"
:loop="false"
:startAt="3"
:idleTimeLimit=3
/>

## Features

- 🎨 **Color-coded Log Levels** - Each log level has distinct colors for quick visual identification
- 🔍 **Interactive Selection Mode** - Browse and inspect logs in a full-screen interactive view
- 📝 **Detailed Log Inspection** - Examine individual log entries with formatted data and context
- 🔎 **Search/Filter Functionality** - Find specific logs with powerful filtering capabilities
- 💅 **JSON Pretty Printing** - Beautifully formatted structured data with syntax highlighting
- 🎭 **Configurable Themes** - Choose from pre-built themes or customize your own colors

## Installation

::: warning Compatbility Note
Pretty Terminal has only been tested in MacOS with the native Terminal app and [Warp](https://www.warp.dev/). 
It may not work as expected in other terminal emulators or operating systems.
:::

```bash
npm install loglayer @loglayer/pretty-terminal serialize-error
```

## Basic Usage

::: warning Development Only
Pretty Terminal is designed to work in a terminal only for local development. It should not be used for production environments.

It is recommended that you disable other transports when using Pretty Terminal to avoid duplicate log output.
:::

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer';
import { getPrettyTerminal } from '@loglayer/pretty-terminal';
import { serializeError } from "serialize-error";

// Create LogLayer instance with the transport
const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    new ConsoleTransport({
      // Example of how to enable a transport for non-development environments
      enabled: process.env.NODE_ENV !== 'development',
    }),
    getPrettyTerminal({
      // Only enable Pretty Terminal in development
      enabled: process.env.NODE_ENV === 'development',
    })
  ],
});

// Start logging!
log.withMetadata({ foo: 'bar' }).info('Hello from Pretty Terminal!');
```

::: warning Single-Instance Only
Because Pretty Terminal is an interactive transport, it may not work well if you run multiple applications in the same terminal window that share the same output stream.

If you need to run multiple applications that use Pretty Terminal in the same terminal window, you can:
1. Use the `disableInteractiveMode` option to disable keyboard input and navigation features
2. Keep interactive mode enabled in only one application and disable it in others

The transport is designed to work as a single interactive instance. `getPrettyTerminal()` can be safely used multiple times in the same application as it uses the same transport reference.
:::

::: warning Performance Note
Logs are stored using an in-memory SQLite database by default. For long-running applications or large log volumes, consider using a persistent storage file using the `logFile` option to avoid out of memory issues.
:::

## Keyboard Controls

The Pretty Terminal Transport provides an interactive interface with three main modes:

### Simple View (Default)

![Simple View](/images/pretty-terminal/simple-view.webp)

The default view shows real-time log output with the following controls:
- `P`: Toggle pause/resume of log output
- `C`: Cycle through view modes (full → truncated → condensed)
- `↑/↓`: Enter selection mode

When paused, new logs are buffered and a counter shows how many logs are waiting. Resuming will display all buffered logs.

The view has three modes:
- **Full View** (default): Shows all information with complete data structures (no truncation)
- **Truncated View**: Shows complete log information including timestamp, ID, level, message, with data structures truncated based on `maxInlineDepth` and `maxInlineLength` settings
- **Condensed View**: Shows only the timestamp, log level and message for a cleaner output (no data shown)

When entering selection mode while paused:
- Only logs that were visible before pause are shown initially
- Buffered logs from pause are tracked as new logs
- The notification shows how many new logs are available
- Pressing ↓ at the bottom will reveal new logs

### Selection Mode

![Selection Mode](/images/pretty-terminal/selection-mode.webp)

An interactive mode for browsing and filtering logs:
- `↑/↓`: Navigate through logs
- `ENTER`: View detailed log information (preserves current filter)
- `TAB`: Return to simple view
- Type to filter logs (searches through all log content)
- `BACKSPACE`: Edit/clear filter text

When filtering is active:
- Only matching logs are displayed
- The filter persists when entering detail view
- Navigation (↑/↓) only moves through filtered results
- New logs that match the filter are automatically included

Each log entry in selection mode shows:
- Timestamp and log ID
- Log level with color coding
- Complete message
- Full structured data inline (like simple view's full mode)
- Selected entry is highlighted with `►`

### Detail View

![Detail View](/images/pretty-terminal/detail-view.webp)

A full-screen view showing comprehensive log information:
- `↑/↓`: Scroll through log content line by line
- `Q/W`: Page up/down through content
- `←/→`: Navigate to previous/next log entry (respects active filter)
- `A/S`: Jump to first/last log entry
- `C`: Toggle array collapse in JSON data
- `J`: Toggle raw JSON view (for easy copying)
- `TAB`: Return to selection view (or return to detail view from JSON view)

Features in Detail View:
- Shows full timestamp and log level
- Displays complete structured data with syntax highlighting
- Shows context (previous and next log entries)
- Shows active filter in header when filtering is enabled
- Auto-updates when viewing latest log (respects current filter)
- Pretty-prints JSON data with color coding
- Collapsible arrays for better readability
- Raw JSON view for easy copying

## Configuration

The Pretty Terminal Transport can be customized with various options:

```typescript
import { getPrettyTerminal, moonlight } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  // Maximum depth for inline data display in truncated mode
  maxInlineDepth: 4,
  
  // Maximum length for inline data in truncated mode
  maxInlineLength: 120,
  
  // Custom theme configuration (default is moonlight)
  theme: moonlight,

  // Optional path to SQLite file for persistent storage
  logFile: 'path/to/logs.sqlite',

  // Enable/disable the transport (defaults to true)
  enabled: process.env.NODE_ENV === 'development',

  // Disable interactive mode for multi-app terminal output (defaults to false)
  disableInteractiveMode: false,
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxInlineDepth` | number | 4 | Maximum depth for displaying nested data inline. Only applies in truncated view mode. Selection mode and detail view always show full depth. |
| `maxInlineLength` | number | 120 | Maximum length for inline data before truncating. Only applies in truncated view mode. Selection mode and detail view always show full content. |
| `theme` | PrettyTerminalTheme | moonlight | Theme configuration for colors and styling |
| `logFile` | string | ":memory:" | Path to SQLite file for persistent storage. Relative paths are resolved from the current working directory. If not provided, uses in-memory database |
| `enabled` | boolean | true | Whether the transport is enabled. If false, all operations will no-op |
| `disableInteractiveMode` | boolean | false | Whether to disable interactive mode (keyboard input and navigation). Useful when multiple applications need to print to the same terminal |

::: warning Security Note
If using the `logFile` option, be aware that:
1. All logs will be stored in the specified SQLite database file. If it exists, the log data will be dropped during initialization.
2. The file will be purged of any existing data when the transport initializes
3. Relative paths (e.g., "logs/app.db") are resolved from the current working directory
4. It is recommended to add the `logFile` path to your `.gitignore` file to avoid committing sensitive log data
5. Do not use the same logfile path in another application (as in two separate applications running the transport against the same file) to avoid data corruption.

If you do have sensitive data that shouldn't be logged in general, use the [Redaction Plugin](/plugins/redaction) to filter out sensitive information before logging.
:::

## Themes

The transport comes with several built-in themes to match your terminal style:

### Moonlight Theme (Default)
A dark theme with cool blue tones, perfect for night-time coding sessions and modern IDEs.

![Moonlight Theme](/images/pretty-terminal/moonlight.webp)

```typescript
import { getPrettyTerminal, moonlight } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  theme: moonlight,
});
```

### Sunlight Theme
A light theme with warm tones, ideal for daytime use, high-glare environments, and printed documentation.

![Sunlight Theme](/images/pretty-terminal/sunlight.webp)

```typescript
import { getPrettyTerminal, sunlight } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  theme: sunlight,
});
```

### Neon Theme
A vibrant, cyberpunk-inspired theme with electric colors and high contrast, perfect for modern tech-focused applications.

![Neon Theme](/images/pretty-terminal/neon.webp)

```typescript
import { getPrettyTerminal, neon } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  theme: neon,
});
```

### Nature Theme
A light theme with organic, earthy colors inspired by forest landscapes. Great for nature-inspired interfaces and applications focusing on readability.

![Nature Theme](/images/pretty-terminal/nature.webp)

```typescript
import { getPrettyTerminal, nature } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  theme: nature,
});
```

### Pastel Theme
A soft, calming theme with gentle colors inspired by watercolor paintings. Perfect for long coding sessions and reduced visual stress.

![Pastel Theme](/images/pretty-terminal/pastel.webp)

```typescript
import { getPrettyTerminal, pastel } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  theme: pastel,
});
```

## Custom Themes

You can create your own theme by implementing the `PrettyTerminalTheme` interface, which uses [`chalk`](https://github.com/chalk/chalk) for color styling:

```typescript
import { getPrettyTerminal, chalk } from '@loglayer/pretty-terminal';

const myCustomTheme = {
  // Configuration for the default log view shown in real-time
  simpleView: {
    // Color configuration for different log levels
    colors: {
      trace: chalk.gray,    // Style for trace level logs
      debug: chalk.blue,    // Style for debug level logs
      info: chalk.green,    // Style for info level logs
      warn: chalk.yellow,   // Style for warning level logs
      error: chalk.red,     // Style for error level logs
      fatal: chalk.bgRed.white,  // Style for fatal level logs - background red with white text
    },
    logIdColor: chalk.dim,      // Style for the unique log identifier
    dataValueColor: chalk.white, // Style for the actual values in structured data
    dataKeyColor: chalk.dim,     // Style for the keys/property names in structured data
    selectorColor: chalk.cyan,   // Style for the selection indicator (►) in selection mode
  },
  detailedView: {
    // Inherits all options from simpleView, plus additional detailed view options
    colors: {
      trace: chalk.gray,
      debug: chalk.blue,
      info: chalk.green,
      warn: chalk.yellow,
      error: chalk.red,
      fatal: chalk.bgRed.white,
    },
    logIdColor: chalk.dim,
    dataValueColor: chalk.white,
    dataKeyColor: chalk.dim,
    
    // Additional detailed view specific options
    headerColor: chalk.bold.cyan,     // Style for section headers
    labelColor: chalk.bold,           // Style for field labels (e.g., "Timestamp:", "Level:")
    separatorColor: chalk.dim,        // Style for visual separators
    
    // Configuration for JSON pretty printing
    jsonColors: {
      keysColor: chalk.dim,           // Style for JSON property names
      dashColor: chalk.dim,           // Style for array item dashes
      numberColor: chalk.yellow,      // Style for numeric values
      stringColor: chalk.green,       // Style for string values
      multilineStringColor: chalk.green, // Style for multiline strings
      positiveNumberColor: chalk.yellow, // Style for positive numbers
      negativeNumberColor: chalk.red,    // Style for negative numbers
      booleanColor: chalk.cyan,         // Style for boolean values
      nullUndefinedColor: chalk.gray,   // Style for null/undefined values
      dateColor: chalk.magenta,         // Style for date values
    },
  },
};

const transport = getPrettyTerminal({
  theme: myCustomTheme,
});
```
