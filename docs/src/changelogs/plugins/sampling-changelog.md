
## 1.0.0

- Initial release
- Rate-based sampling with `default` and `per_level` strategies
- Custom `shouldSample` callback for content-aware filtering
- Fail-open behavior when callback throws
- Error and fatal levels kept by default (can be overridden via `perLevel` or callback)
