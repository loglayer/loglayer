// @ts-nocheck
'use strict';

/**
 * Creates a string with the same length as `numSpaces` parameter
 **/
export function indent(numSpaces) {
  return new Array(numSpaces+1).join(' ');
};

/**
 * Gets the string length of the longer index in a hash
 **/
export function getMaxIndexLength(input) {
  var maxWidth = 0;

  Object.getOwnPropertyNames(input).forEach(function(key) {
    // Skip undefined values.
    if (input[key] === undefined) {
      return;
    }

    maxWidth = Math.max(maxWidth, key.length);
  });
  return maxWidth;
};

export function isIsoStringDate (isoString) {
  if (typeof isoString !== 'string') {
    return false;
  }
  // More flexible regex that handles:
  // - Optional milliseconds
  // - Optional timezone offset or Z
  // - Optional T separator (space also valid)
  if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/.test(isoString)) {
    return false;
  }
  const testDate = new Date(isoString);
  return !Number.isNaN(testDate.getTime());
};