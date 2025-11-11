::: warning TypeScript Interface Limitations
Currently, mixin augments won't be captured by the `ILogLayer` and `ILogBuilder` types. This means that if your code uses these interfaces (as recommended in the [TypeScript tips page](/logging-api/typescript)), TypeScript won't recognize the mixin methods. If you are a TypeScript expert, we welcome ideas on how to improve this. If you do use the interface, you may have to type cast the LogLayer instance to `LogLayer` to properly get the augments recognized by TypeScript.
:::

