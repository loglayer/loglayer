# `@loglayer/transport-pretty-terminal` Changelog

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
