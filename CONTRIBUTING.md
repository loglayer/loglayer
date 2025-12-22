# Contributing

- Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
  * The commit message should be in the format `<type>(<scope>): <description>`. The `scope` is optional. The description must be lowercased.
  * ex: `feat: add new option to loglayer`
- This project uses [changeset](https://github.com/changesets/changesets) for managing releases. Use the `pnpm run add-changeset` command to add a changeset for your changes.
  * Fixes should be added to the `patch` category.
  * New features should be added to the `minor` category.
  * Breaking changes should be added to the `major` category.
- Make sure to add tests for any code written. They are written using [vitest](https://vitest.dev/). The tests should pass before submitting a PR.
- Make sure to add appropriate documentation for new features and changes. It is recommended to use AI (this repo was designed to work with Claude Code) to help with this.
- Package dependencies should be pinned to exact versions (no `^` or `~` prefixes).
  * Example: Use `"lodash": "4.17.21"` instead of `"lodash": "^4.17.21"`
- Make sure to run the linter before submitting a PR. The linter is run using the `lint` command. It uses
  [biome.js](https://biomejs.dev/) for linting.
- The PR must pass the CI checks before it can be merged. This means it should pass linting and tests.
