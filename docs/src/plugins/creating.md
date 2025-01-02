# Creating Plugins

A plugin is a plain object that implements the `LogLayerPlugin` interface from `loglayer`:

```typescript
interface LogLayerPlugin {
  /**
   * Unique identifier for the plugin. Used for selectively disabling / enabling
   * and removing the plugin.
   */
  id?: string;
  
  /**
   * If true, the plugin will skip execution
   */
  disabled?: boolean;
  
  /**
   * Called after the assembly of the data object that contains
   * metadata / context / error data before being sent to the logging library.
   */
  onBeforeDataOut?(params: PluginBeforeDataOutParams): Record<string, any> | null | undefined;
  
  /**
   * Called to modify message data before it is sent to the logging library.
   */
  onBeforeMessageOut?(params: PluginBeforeMessageOutParams): MessageDataType[];
  
  /**
   * Controls whether the log entry should be sent to the logging library.
   */
  shouldSendToLogger?(params: PluginShouldSendToLoggerParams): boolean;
  
  /**
   * Called when withMetadata() or metadataOnly() is called.
   */
  onMetadataCalled?(metadata: Record<string, any>): Record<string, any> | null | undefined;
}
```

## Plugin Lifecycle Methods

### onBeforeDataOut

Allows you to modify or transform the data object containing metadata, context, and error information before it's sent to the logging library. This is useful for adding additional fields, transforming data formats, or filtering sensitive information.

**Method Signature:**
```typescript
onBeforeDataOut?(params: PluginBeforeDataOutParams): Record<string, any> | null | undefined
```

**Parameters:**
```typescript
interface PluginBeforeDataOutParams {
  data?: Record<string, any>;  // The object containing metadata / context / error data
  logLevel: LogLevel;          // Log level of the data
}
```

**Example:**
```typescript
const dataEnrichmentPlugin = {
  id: 'data-enrichment',
  onBeforeDataOut: ({ data, logLevel }) => {
    return {
      ...(data || {}),
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      logLevel
    }
  }
}
```

### onBeforeMessageOut

Allows you to modify or transform the message content before it's sent to the logging library. This is useful for adding prefixes, formatting messages, or transforming message content.

**Method Signature:**
```typescript
onBeforeMessageOut?(params: PluginBeforeMessageOutParams): MessageDataType[]
```

**Parameters:**
```typescript
interface PluginBeforeMessageOutParams {
  messages: any[];    // Message data that is copied from the original
  logLevel: LogLevel; // Log level of the message
}
```

**Example:**
```typescript
const messageFormatterPlugin = {
  id: 'message-formatter',
  onBeforeMessageOut: ({ messages, logLevel }) => {
    return messages.map(msg => `[${logLevel.toUpperCase()}][${new Date().toISOString()}] ${msg}`)
  }
}
```

### shouldSendToLogger

Controls whether a log entry should be sent to the logging library. This is useful for implementing log filtering, rate limiting, or environment-specific logging.

**Method Signature:**
```typescript
shouldSendToLogger?(params: PluginShouldSendToLoggerParams): boolean
```

**Parameters:**
```typescript
interface PluginShouldSendToLoggerParams {
  messages: any[];              // Message data that is copied from the original
  logLevel: LogLevel;          // Log level of the message
  data?: Record<string, any>;  // The object containing metadata / context / error data
}
```

**Example:**
```typescript
const productionFilterPlugin = {
  id: 'production-filter',
  shouldSendToLogger: ({ logLevel, data }) => {
    // Filter out debug logs in production
    if (process.env.NODE_ENV === 'production') {
      return logLevel !== 'debug'
    }
    // Rate limit error logs
    if (logLevel === 'error') {
      return !isRateLimited('error-logs')
    }
    return true
  }
}
```

### onMetadataCalled

Intercepts and modifies metadata when `withMetadata()` or `metadataOnly()` is called. This is useful for transforming or enriching metadata before it's attached to logs.

**Method Signature:**
```typescript
onMetadataCalled?(metadata: Record<string, any>): Record<string, any> | null | undefined
```

**Parameters:**
- `metadata`: Record<string, any> - The metadata object being added

**Example:**
```typescript
const metadataEnrichmentPlugin = {
  id: 'metadata-enrichment',
  onMetadataCalled: (metadata) => {
    return {
      ...metadata,
      enrichedAt: new Date().toISOString(),
      userId: getCurrentUser()?.id
    }
  }
}
```