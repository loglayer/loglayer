::: tip DataDog Error Tracking
To use [DataDog's Error Tracking](https://docs.datadoghq.com/logs/error_tracking/) feature, configure the `errorFieldName` as `error` in your LogLayer configuration.

Alternatively, you can use DataDog's [Pipeline Processing to remap](https://docs.datadoghq.com/logs/error_tracking/backend/?tab=serilog#setup) the default `err` field to `error`.

You can also add remapping via DataDog `Logs` > `Configuration` > `Standard Attributes` and add remapping for the `error.message` / `error.stack` attributes (or add a new one for these if they do not exist) and remap to how you've configured LogLayer.

For example, attribute `error.message` might remap to `err.message,metadata.err.message`, depending on how LogLayer is configured.
:::
