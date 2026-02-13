Fetch the latest version info for the npm package specified by $ARGUMENTS.

Run the following command to get the package info:

```
npm view $ARGUMENTS version description dist-tags time --json
```

Then present the results in a concise summary showing:
- Package name
- Latest version
- Description
- All dist-tags (latest, next, etc.)
- Last publish date
