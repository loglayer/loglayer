---
title: "LogLayer: The modern logging library for Typescript / Javascript"
description: A structured logging library with a fluent API for specifying log messages, metadata and errors

layout: home

hero:
  name: "LogLayer"
  text: "Unifies Logging"
  tagline: "A layer on top of <span id=\"js-lib-label\" class=\"visible\">Javascript logging libraries</span> to provide a consistent logging experience."
  image:
    src: /images/loglayer.jpg
    alt: LogLayer
  actions:
    - theme: brand
      text: What is LogLayer?
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
    details: Fan out logs to multiple logging libraries and cloud providers such as DataDog and New Relic at the same time.
  - title: OpenTelemetry Support
    details: A transport and plugin is available for connecting logs to OpenTelemetry.
  - title: Log File Rotation Support
    details: Rotate log files based on time or size with optional batching and compression with the Log File Rotation transport.
---

---

<!--@include: ./_partials/fte-pino-example.md-->

<!--@include: ./transports/_partials/transport-list.md-->

<!--@include: ./plugins/_partials/plugin-list.md-->
