---
"@loglayer/transport-pretty-terminal": major
"@loglayer/docs": patch
---

New features for the Pretty Terminal Transport

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

