
::: tip Message Parameters
The `messages` parameter is an array because LogLayer supports multiple parameters for formatting. See the [Basic Logging](/logging-api/basic-logging.html#message-parameters) section for more details.
:::

For example, if a user does the following:

```typescript
logger.withMetadata({foo: 'bar'}).info('hello world', 'foo');
```

The parameters passed to `shipToLogger` would be:

```typescript
{
  logLevel: 'info',
  messages: ['hello world', 'foo'],
  data: {foo: 'bar'},
  hasData: true
}
```