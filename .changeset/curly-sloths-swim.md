---
"@loglayer/transport-aws-lambda-powertools": major
---

BREAKING: If using multiple message parameters, they will be `.join(" ")` instead of `.join("")`
