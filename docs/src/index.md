---
title: "LogLayer: The modern logging library for Typescript / Javascript"
description: A structured logging library with a fluent API for specifying log messages, metadata and errors

layout: home

hero:
  name: "LogLayer"
  text: "Unifies Logging"
  tagline: "A layer on top of <span id=\"js-lib-label\" class=\"visible\">Javascript logging libraries</span> to provide a consistent logging experience."
  image:
    src: /images/loglayer.png
    alt: LogLayer logo by Akshaya Madhavan
  actions:
    - theme: brand
      text: Why Use LogLayer?
      link: /introduction
    - theme: alt
      text: Quickstart
      link: /getting-started
    - theme: alt
      text: GitHub (MIT Licensed)
      link: https://github.com/loglayer/loglayer

features:
  - title: Structured Logging
    details: Write logs with a fluid API that makes adding tags, metadata and errors simple.
  - title: Bring Your Own Logger
    details: Use console logging when starting out, then switch to another logging provider later without changing your application code.
  - title: Extensible Plugin System
    details: Transform, enrich, and filter logs with plugins that lets you customize every aspect of your logging pipeline.
  - title: Multi-logger Support
    details: Fan out logs to multiple logging libraries like Pino and cloud providers like DataDog at the same time.
  - title: OpenTelemetry Support
    details: A transport and plugin is available for connecting logs to OpenTelemetry.
  - title: StatsD Support
    details: A mixin is available to add methods to LogLayer to easily send metrics with your logs to StatsD.
  - title: HTTP Support
    details: A transport is available to send logs via HTTP.
  - title: Log File Rotation Support
    details: Rotate log files based on time or size with optional batching and compression with the Log File Rotation transport.
---

---

<script setup>
import { NuAsciinemaPlayer } from '@nolebase/ui-asciinema'
import 'asciinema-player/dist/bundle/asciinema-player.css'
</script>

<!--@include: ./_partials/fte-pino-example.md-->

### Pretty Print Logs with Search

Use the [Pretty Terminal Transport](/transports/pretty-terminal.md) to view logs in the terminal with filtering and detailed viewing capabilities.

<NuAsciinemaPlayer
src="/asciinema/pretty-terminal.cast"
:preload="true"
:cols="400"
:rows="20"
:auto-play="true"
:controls="true"
:terminal-font-size="'14px'"
:loop="true"
:startAt="3"
:idleTimeLimit=3
/>

### Add Metrics Support with Mixins

Extend LogLayer with StatsD metrics support using the [Hot Shots Mixin](/mixins/hot-shots):

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { StatsD } from 'hot-shots';
import { hotshotsMixin } from '@loglayer/mixin-hot-shots';

// Create a StatsD client
const statsd = new StatsD({
  host: 'localhost',
  port: 8125
});

// Register the mixin (must be called before creating LogLayer instances)
useLogLayerMixin(hotshotsMixin(statsd));

// Create LogLayer instance
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

// Use StatsD methods through the stats property
log.stats.increment('request.count').send();
log.info('Request received');
log.stats.timing('request.duration', 150).send();
log.info('Request processed');
log.stats.gauge('active.connections', 42).send();
log.info('Connection established');
```

<!--@include: ./transports/_partials/transport-list.md-->

<!--@include: ./plugins/_partials/plugin-list.md-->

<!--@include: ./integrations/_partials/integration-list.md-->

<!--@include: ./mixins/_partials/mixin-list.md-->

LogLayer is made with ❤️ by [Theo Gravity](https://suteki.nu). Logo by [Akshaya Madhavan](https://www.linkedin.com/in/akshaya-madhavan).