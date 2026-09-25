---
"@loglayer/transport-google-cloud-logging": minor
---

Add an `onError` config option and prevent unhandled rejections from `write()`.

The transport previously called the Google Cloud Logging `write()` API without handling the returned promise, so failures that occur before the SDK's `defaultWriteDeleteCallback` is invoked (eg, project or resource detection failures) — and all API failures when no callback is configured — surfaced as unhandled rejections. Errors thrown while creating the log entry also propagated to the caller.

Now all transport-level failures are caught and reported to `onError` (documented in the site documentation since the last release but previously unimplemented); failures are silently ignored if `onError` is not configured. `onError` complements `defaultWriteDeleteCallback`: when the SDK callback is configured it receives API request failures, while `onError` receives everything else — no failure is double-reported. `onError` is invoked in a guarded context, so a throwing callback cannot produce an unhandled rejection or propagate to the caller.
