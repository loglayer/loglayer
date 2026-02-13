module.exports = {
  "sortFirst": ["name", "description", "version", "type", "private", "main", "module", "exports", "types", "sideEffects", "license", "repository", "author", "keywords", "scripts", "dependencies", "devDependencies", "peerDependencies", "resolutions"],
  "sortAz": [],
  "semverGroups": [
    {
      "range": ">=",
      "dependencyTypes": ["peer"],
      "dependencies": ["**"],
      "packages": ["**"]
    }
  ],
  "versionGroups": [
    {
      "label": "allow flexible peer dependency ranges",
      "dependencyTypes": ["peer"],
      "packages": ["@loglayer/elysia", "@loglayer/fastify", "@loglayer/mixin-hot-shots"],
      "isIgnored": true
    },
    {
      "label": "use workspace protocol for local packages",
      "dependencies": ["$LOCAL"],
      "dependencyTypes": ["!local", "!peer"],
      "pinVersion": "workspace:*"
    }
  ]
}
