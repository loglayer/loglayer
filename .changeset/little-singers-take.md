---
"loglayer": major
---

New version 7 introduces [Mixins](/mixins), a system for extending LogLayer and LogBuilder prototypes with custom methods and functionality. Unlike plugins (which intercept and modify log processing) or transports (which send logs to destinations), mixins add new methods directly to the LogLayer API, enabling you to integrate third-party libraries and add domain-specific capabilities beyond logging.

*v7 does not have any breaking changes; no migration steps are necessary to upgrade from v6 -> v7 of `loglayer`.*