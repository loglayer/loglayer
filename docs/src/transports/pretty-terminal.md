<script setup>
import { NuAsciinemaPlayer } from '@nolebase/ui-asciinema'
import 'asciinema-player/dist/bundle/asciinema-player.css'
</script>

# Pretty Terminal Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-pretty-terminal)](https://www.npmjs.com/package/@loglayer/transport-pretty-terminal)

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/pretty-terminal)

The Pretty Terminal Transport provides an interactive and visually appealing terminal output for your logs. It's designed to enhance the development experience with features like real-time log display, interactive browsing, and beautiful themes.

<NuAsciinemaPlayer
src="/asciinema/pretty-terminal.cast"
:preload="true"
:cols="400"
:rows="20"
:auto-play="false"
:controls="true"
:terminal-font-size="'14px'"
:loop="false"
:startAt="3"
:idleTimeLimit=2
/>

## Features

- 🎨 **Color-coded Log Levels** - Each log level has distinct colors for quick visual identification
- 🔍 **Interactive Selection Mode** - Browse and inspect logs in a full-screen interactive view
- 📝 **Detailed Log Inspection** - Examine individual log entries with formatted data and context
- 🔎 **Search/Filter Functionality** - Find specific logs with powerful filtering capabilities
- 💅 **JSON Pretty Printing** - Beautifully formatted structured data with syntax highlighting
- 🎭 **Configurable Themes** - Choose from pre-built themes or customize your own colors
- 🔄 **Real-time Updates** - See logs as they happen with live updates
- 📊 **Context Awareness** - View previous and next logs when inspecting entries

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

It will definitely not work if you have multiple instances that use Pretty Terminal running in the same terminal window.

It is designed to work as a single instance transport. `getPrettyTerminal()` can be safely used multiple times in the same application as it
uses the same transport reference.
:::

::: warning Performance Note
Logs are stored using an in-memory SQLite database by default. For long-running applications or large log volumes, consider using a persistent storage file using the `logFile` option to avoid out of memory issues.
:::

## Keyboard Controls

The Pretty Terminal Transport provides an interactive interface with three main modes:

### Simple View (Default)

![Simple View](/images/pretty-terminal/simple-view.png)

The default view shows real-time log output with the following controls:
- `P`: Toggle pause/resume of log output
- `TAB`: Enter selection mode

When paused, new logs are buffered and a counter shows how many logs are waiting. Resuming will display all buffered logs.

### Selection Mode

![Selection Mode](/images/pretty-terminal/selection-mode.png)

An interactive mode for browsing and filtering logs:
- `↑/↓`: Navigate through logs
- `ENTER`: View detailed log information
- `TAB`: Return to simple view
- Type to filter logs (searches through all log content)
- `BACKSPACE`: Edit/clear filter text

### Detail View

![Detail View](/images/pretty-terminal/detail-view.png)

A full-screen view showing comprehensive log information:
- `↑/↓`: Scroll through log content line by line
- `Q/W`: Page up/down through content
- `←/→`: Navigate to previous/next log entry
- `A/S`: Jump to first/last log entry
- `C`: Toggle array collapse in JSON data
- `J`: Toggle raw JSON view (for easy copying)
- `TAB`: Return to selection view (or return to detail view from JSON view)

Features in Detail View:
- Shows full timestamp and log level
- Displays complete structured data with syntax highlighting
- Shows context (previous and next log entries)
- Auto-updates when viewing latest log
- Pretty-prints JSON data with color coding
- Collapsible arrays for better readability
- Raw JSON view for easy copying

## Configuration

The Pretty Terminal Transport can be customized with various options:

```typescript
import { getPrettyTerminal, moonlight } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  // Maximum depth for inline data display
  maxInlineDepth: 4,
  
  // Maximum length for inline data
  maxInlineLength: 120,
  
  // Custom theme configuration (default is moonlight)
  theme: moonlight,

  // Optional path to SQLite file for persistent storage
  logFile: 'path/to/logs.sqlite',

  // Enable/disable the transport (defaults to true)
  enabled: process.env.NODE_ENV === 'development',
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxInlineDepth` | number | 4 | Maximum depth for displaying nested data inline |
| `maxInlineLength` | number | 120 | Maximum length for inline data before truncating |
| `theme` | PrettyTerminalTheme | moonlight | Theme configuration for colors and styling |
| `logFile` | string | ":memory:" | Path to SQLite file for persistent storage. Relative paths are resolved from the current working directory. If not provided, uses in-memory database |
| `enabled` | boolean | true | Whether the transport is enabled. If false, all operations will no-op |

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

![Moonlight Theme](/images/pretty-terminal/moonlight.png)

```typescript
import { getPrettyTerminal, moonlight } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  theme: moonlight,
});
```

### Sunlight Theme
A light theme with warm tones, ideal for daytime use, high-glare environments, and printed documentation.

![Sunlight Theme](/images/pretty-terminal/sunlight.png)

```typescript
import { getPrettyTerminal, sunlight } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  theme: sunlight,
});
```

### Neon Theme
A vibrant, cyberpunk-inspired theme with electric colors and high contrast, perfect for modern tech-focused applications.

![Neon Theme](/images/pretty-terminal/neon.png)

```typescript
import { getPrettyTerminal, neon } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  theme: neon,
});
```

### Nature Theme
A light theme with organic, earthy colors inspired by forest landscapes. Great for nature-inspired interfaces and applications focusing on readability.

![Nature Theme](/images/pretty-terminal/nature.png)

```typescript
import { getPrettyTerminal, nature } from '@loglayer/pretty-terminal';

const transport = getPrettyTerminal({
  theme: nature,
});
```

### Pastel Theme
A soft, calming theme with gentle colors inspired by watercolor paintings. Perfect for long coding sessions and reduced visual stress.

![Pastel Theme](/images/pretty-terminal/pastel.png)

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
