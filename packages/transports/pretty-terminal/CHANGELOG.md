# `@loglayer/transport-pretty-terminal` Changelog

## 3.1.3

### Patch Changes

- [#207](https://github.com/loglayer/loglayer/pull/207) [`738ebe4`](https://github.com/loglayer/loglayer/commit/738ebe405715662ad9d1417dffe8ab547695afff) Thanks [@theogravity](https://github.com/theogravity)! - Doc updates

## 3.1.2

### Patch Changes

- [#203](https://github.com/loglayer/loglayer/pull/203) [`801081b`](https://github.com/loglayer/loglayer/commit/801081bd5174c0e9ae3055ad4982ee2891c0fa4a) Thanks [@theogravity](https://github.com/theogravity)! - Documentation updates

## 3.1.1

### Patch Changes

- [#200](https://github.com/loglayer/loglayer/pull/200) [`a2f5a17`](https://github.com/loglayer/loglayer/commit/a2f5a17626279f9545c96796ca181938fe1ed905) Thanks [@theogravity](https://github.com/theogravity)! - Package dev dep updates, linting updates

- Updated dependencies [[`a2f5a17`](https://github.com/loglayer/loglayer/commit/a2f5a17626279f9545c96796ca181938fe1ed905)]:
  - @loglayer/transport@2.2.1
  - @loglayer/shared@2.3.1

## 3.1.0

### Minor Changes

- [#190](https://github.com/loglayer/loglayer/pull/190) [`818bae5`](https://github.com/loglayer/loglayer/commit/818bae5efbc4212013ac41878c1e4c4f5594e19c) Thanks [@theogravity](https://github.com/theogravity)! - Update to use new `LogLevelType` instead of `LogLevel` where applicable

### Patch Changes

- Updated dependencies [[`818bae5`](https://github.com/loglayer/loglayer/commit/818bae5efbc4212013ac41878c1e4c4f5594e19c), [`818bae5`](https://github.com/loglayer/loglayer/commit/818bae5efbc4212013ac41878c1e4c4f5594e19c)]:
  - @loglayer/shared@2.3.0
  - @loglayer/transport@2.2.0

## 3.0.3

### Patch Changes

- Updated dependencies [[`a66ce9b`](https://github.com/loglayer/loglayer/commit/a66ce9ba4f05d912576d3754fe74c5054ae8230d)]:
  - @loglayer/transport@2.1.1
  - @loglayer/shared@2.2.1

## 3.0.2

### Patch Changes

- Updated dependencies [[`09e33ab`](https://github.com/loglayer/loglayer/commit/09e33ab216e35502ec9692a5ed44878a26573b1b)]:
  - @loglayer/transport@2.1.0
  - @loglayer/shared@2.2.0

## 3.0.1

### Patch Changes

- [#166](https://github.com/loglayer/loglayer/pull/166) [`4c4eebb`](https://github.com/loglayer/loglayer/commit/4c4eebb432d27c49294d40e8e7149fb6c049f598) Thanks [@theogravity](https://github.com/theogravity)! - Move the filter search bar to the bottom of the screen

## 3.0.0

### Major Changes

- [#164](https://github.com/loglayer/loglayer/pull/164) [`5647ba1`](https://github.com/loglayer/loglayer/commit/5647ba1b7c4265c92932dd5b549f24b745829540) Thanks [@theogravity](https://github.com/theogravity)! - Breaking: Now uses up/down instead of tab key to get into selection view

### Patch Changes

- [`2dbc3a8`](https://github.com/loglayer/loglayer/commit/2dbc3a897c547a63e885ccf166405ac40865cd3f) Thanks [@theogravity](https://github.com/theogravity)! - Fix link to pretty terminal gif

## 2.0.0

### Major Changes

- [#161](https://github.com/loglayer/loglayer/pull/161) [`459c1cf`](https://github.com/loglayer/loglayer/commit/459c1cf591e14a50a94690e590bed3efecdfb111) Thanks [@theogravity](https://github.com/theogravity)! - New features for the Pretty Terminal Transport

  - Added new selection mode behavior when entering from paused state:

    - Only shows logs that were visible before pause
    - Buffered logs from pause are tracked as new logs
    - Shows notification for number of new logs available
    - Press ↓ at bottom to reveal new logs

  - Improved filtering functionality:

    - Filter context is now preserved when entering detail view
    - Filter text is displayed in detail view header
    - Navigation in detail view (←/→) respects current filter
    - Real-time updates in detail view maintain filter context

  - Enhanced log count efficiency:

    - Added new methods to LogStorage for optimized counting
    - Improved performance by using SQL COUNT queries
    - Detail view now shows accurate total log count
    - Selection view updates counts without full log reload

  - Improved data display in selection mode:

    - Now shows full inline data like simple view's full mode
    - No more truncation of structured data
    - Better readability with consistent formatting
    - Maintains performance with optimized rendering

  - Documentation improvements:
    - Added detailed section about selection mode behavior
    - Updated keyboard controls documentation
    - Added notes about filter persistence
    - Improved theme configuration examples

## 1.0.0

### Major Changes

- [#158](https://github.com/loglayer/loglayer/pull/158) [`5e9ec91`](https://github.com/loglayer/loglayer/commit/5e9ec9178d2a303ce1bf6e44f96efc636db361ca) Thanks [@theogravity](https://github.com/theogravity)! - First version of the Pretty Terminal transport

### Patch Changes

- [#160](https://github.com/loglayer/loglayer/pull/160) [`161029a`](https://github.com/loglayer/loglayer/commit/161029ae9d89b600ab19bf15cbd500f5358f2403) Thanks [@theogravity](https://github.com/theogravity)! - external dependency version updates

- Updated dependencies [[`161029a`](https://github.com/loglayer/loglayer/commit/161029ae9d89b600ab19bf15cbd500f5358f2403)]:
  - @loglayer/transport@2.0.2
  - @loglayer/shared@2.1.1
