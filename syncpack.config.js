module.exports = {
  "semverRange": "exact",
  "sortFirst": ["name", "description", "version", "type", "private", "main", "module", "exports", "types", "sideEffects", "license", "repository", "author", "keywords", "scripts", "dependencies", "devDependencies", "peerDependencies", "resolutions"],
  "sortAz": [],
  "semverGroups": [
    {
      "range": ">=",
      "dependencyTypes": ["peer"],
      "dependencies": ["hot-shots", "elysia", "loglayer"],
      "packages": ["**"]
    },
    {
      "range": "",
      "dependencyTypes": ["prod", "dev", "resolutions", "overrides"],
      "dependencies": ["**"],
      "packages": ["**"]
    }
  ],
  "versionGroups": [
    {
      "label": "allow elysia peer dependency range",
      "dependencies": ["elysia", "loglayer"],
      "dependencyTypes": ["peer"],
      "packages": ["@loglayer/elysia"],
      "isIgnored": true
    },
    {
      "label": "use workspace protocol for local packages",
      "dependencies": ["$LOCAL"],
      "dependencyTypes": ["!local"],
      "pinVersion": "workspace:*"
    },
    {
      "label": "allow hot-shots version flexibility",
      "dependencies": ["hot-shots"],
      "packages": ["**"],
      "isIgnored": true
    }
  ]
}
