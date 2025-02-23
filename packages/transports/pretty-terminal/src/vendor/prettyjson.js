// @ts-nocheck
import chalk from "chalk";
import * as Utils from "./utils.js";
import { isIsoStringDate } from "./utils.js";

const conflictChars = /[^\w\s\n\r\v\t\.,]/i;

// Helper function to detect if an object should be printed or ignored
const isPrintable = (input, options) => input !== undefined || options.renderUndefined;

// Helper function to detect if an object can be directly serializable
const isSerializable = (input, onlyPrimitives, options) => {
  if (
    typeof input === "boolean" ||
    typeof input === "number" ||
    typeof input === "function" ||
    input === null ||
    input === undefined ||
    input instanceof Date
  ) {
    return true;
  }
  if (typeof input === "string" && input.indexOf("\n") === -1) {
    return true;
  }

  if (options.inlineArrays && !onlyPrimitives) {
    if (Array.isArray(input) && isSerializable(input[0], true, options)) {
      return true;
    }
  }

  return false;
};

/**
 * @param {Function} colorFn
 * @param {PrettyJSONOptions} options
 */
const getColorRenderer = (colorFn, options) => {
  if (options.noColor) {
    return (text) => text;
  }

  if (typeof colorFn !== 'function') {
    return (text) => text;
  }

  return colorFn;
};

const addColorToData = (input, options) => {
  if (options.noColor) {
    return input;
  }

  if (input instanceof Date) {
    return getColorRenderer(options.dateColor, options)(input.toISOString());
  }
  if (typeof input === "string") {
    if (isIsoStringDate(input)) {
      return getColorRenderer(options.dateColor, options)(input);
    }
    // Print strings in regular terminal color
    return getColorRenderer(options.stringColor, options)(input);
  }

  const sInput = `${input}`;

  if (typeof input === "boolean") {
    return getColorRenderer(options.booleanColor, options)(sInput);
  }
  if (input === null || input === undefined) {
    return getColorRenderer(options.nullUndefinedColor, options)(sInput);
  }
  if (typeof input === "number") {
    if (input >= 0) {
      return getColorRenderer(options.positiveNumberColor, options)(sInput);
    }
    return getColorRenderer(options.negativeNumberColor, options)(sInput);
  }
  if (typeof input === "function") {
    return "function() {}";
  }

  if (Array.isArray(input)) {
    return input.join(", ");
  }

  return sInput;
};

const colorMultilineString = (options, line) => getColorRenderer(options.multilineStringColor, options)(line);

const indentLines = (string, spaces, options) => {
  let lines = string.split("\n");
  lines = lines.map((line) => Utils.indent(spaces) + colorMultilineString(options, line));
  return lines.join("\n");
};

const renderToArray = (data, options, indentation) => {
  if (typeof data === "string" && data.match(conflictChars) && options.escape) {
    data = JSON.stringify(data);
  }

  if (!isPrintable(data, options)) {
    return [];
  }

  if (isSerializable(data, false, options)) {
    return [Utils.indent(indentation) + addColorToData(data, options)];
  }

  // Unserializable string means it's multiline
  if (typeof data === "string") {
    return [
      Utils.indent(indentation) + colorMultilineString(options, '"""'),
      indentLines(data, indentation + options.defaultIndentation, options),
      Utils.indent(indentation) + colorMultilineString(options, '"""'),
    ];
  }

  if (Array.isArray(data)) {
    // If the array is empty, render the `emptyArrayMsg`
    if (data.length === 0) {
      return [Utils.indent(indentation) + options.emptyArrayMsg];
    }

    // If arrays should be collapsed and there's data, show [...]
    if (options.collapseArrays && data.length > 0) {
      return [Utils.indent(indentation) + `[... ${data.length} items]`];
    }

    const outputArray = [];

    data.forEach((element) => {
      if (!isPrintable(element, options)) {
        return;
      }

      // Prepend the dash at the beginning of each array's element line
      let line = "- ";
      line = getColorRenderer(options.dashColor, options)(line);
      line = Utils.indent(indentation) + line;

      // If the element of the array is a string, bool, number, or null
      // render it in the same line
      if (isSerializable(element, false, options)) {
        line += renderToArray(element, options, 0)[0];
        outputArray.push(line);

        // If the element is an array or object, render it in next line
      } else {
        outputArray.push(line);
        outputArray.push.apply(outputArray, renderToArray(element, options, indentation + options.defaultIndentation));
      }
    });

    return outputArray;
  }

  if (data instanceof Error) {
    return renderToArray(
      {
        message: data.message,
        stack: data.stack.split("\n"),
      },
      options,
      indentation,
    );
  }

  // If values alignment is enabled, get the size of the longest index
  // to align all the values
  const maxIndexLength = options.noAlign ? 0 : Utils.getMaxIndexLength(data);
  let key;
  const output = [];

  Object.getOwnPropertyNames(data).forEach((i) => {
    if (!isPrintable(data[i], options)) {
      return;
    }

    // Prepend the index at the beginning of the line
    key = `${i}: `;
    key = getColorRenderer(options.keysColor, options)(key);
    key = Utils.indent(indentation) + key;

    // If the value is serializable, render it in the same line
    if (isSerializable(data[i], false, options)) {
      const nextIndentation = options.noAlign ? 0 : maxIndexLength - i.length;
      key += renderToArray(data[i], options, nextIndentation)[0];
      output.push(key);

      // If the index is an array or object, render it in next line
    } else {
      output.push(key);
      output.push.apply(output, renderToArray(data[i], options, indentation + options.defaultIndentation));
    }
  });
  return output;
};
/**
 * @typedef {Object} PrettyJSONOptions
 * @property {Function} [stringColor=null] Chalk color function for strings
 * @property {Function} [multilineStringColor=null] Chalk color function for multiline strings
 * @property {Function} [keysColor=chalk.green] Chalk color function for keys in hashes
 * @property {Function} [dashColor=chalk.green] Chalk color function for dashes in arrays
 * @property {Function} [numberColor=chalk.blue] Default Chalk color function for numbers
 * @property {Function} [positiveNumberColor=numberColor] Chalk color function for positive numbers
 * @property {Function} [negativeNumberColor=numberColor] Chalk color function for negative numbers
 * @property {Function} [booleanColor=chalk.cyan] Chalk color function for boolean values
 * @property {Function} [nullUndefinedColor=chalk.grey] Chalk color function for null || undefined
 * @property {Function} [dateColor=chalk.magenta] Chalk color function for Date objects
 * @property {number} [defaultIndentation=2] Indentation spaces per object level
 * @property {string} [emptyArrayMsg="(empty array)"] Replace empty strings with
 * @property {boolean} [noColor] Flag to disable colors
 * @property {boolean} [noAlign] Flag to disable alignment
 * @property {boolean} [escape] Flag to escape printed content
 * @property {boolean} [collapseArrays] Flag to collapse arrays
 */
/**
 * Mutating function that ensures we have a valid options object
 * @param {PrettyJSONOptions} options
 * @returns PrettyJSONOptions
 */
const validateOptionsAndSetDefaults = (options) => {
  options = options || {};
  options.emptyArrayMsg = options.emptyArrayMsg || "(empty array)";
  options.keysColor = options.keysColor || chalk.green;
  options.dashColor = options.dashColor || chalk.green;
  options.booleanColor = options.booleanColor || chalk.cyan;
  options.nullUndefinedColor = options.nullUndefinedColor || chalk.grey;
  options.numberColor = options.numberColor || chalk.blue;
  options.positiveNumberColor = options.positiveNumberColor || options.numberColor;
  options.negativeNumberColor = options.negativeNumberColor || options.numberColor;
  options.dateColor = options.dateColor || chalk.magenta;
  options.defaultIndentation = options.defaultIndentation || 2;
  options.noColor = !!options.noColor;
  options.noAlign = !!options.noAlign;
  options.escape = !!options.escape;
  options.renderUndefined = !!options.renderUndefined;
  options.collapseArrays = !!options.collapseArrays;

  options.stringColor = options.stringColor || null;
  options.multilineStringColor = options.multilineStringColor || options.stringColor || null;

  return options;
};
/**
 * ### Render function
 * *Parameters:*
 *
 * @param {*} data: Data to render
 * @param {PrettyJSONOptions} options: Hash of different options
 * @param {*} indentation **`indentation`**: Base indentation of the output
 *
 * *Example of options hash:*
 *
 *     {
 *       emptyArrayMsg: '(empty)',    // Rendered message on empty strings
 *       keysColor: 'blue',           // Color for keys in hashes
 *       dashColor: 'red',            // Color for the dashes in arrays
 *       stringColor: 'grey',         // Color for strings
 *       multilineStringColor: 'cyan' // Color for multiline strings
 *       defaultIndentation: 2        // Indentation on nested objects
 *     }
 * @returns string with the rendered data
 */
export function render(data, options, indentation) {
  // Default values
  indentation = indentation || 0;
  options = validateOptionsAndSetDefaults(options);

  return renderToArray(data, options, indentation).join("\n");
};

/**
 * ### Render from string function
 * *Parameters:*
 *
 * @param {*} data: Data to render
 * @param {PrettyJSONOptions} options: Hash of different options
 * @param {*} indentation **`indentation`**: Base indentation of the output
 *
 * *Example of options hash:*
 *
 *     {
 *       emptyArrayMsg: '(empty)', // Rendered message on empty strings
 *       keysColor: 'blue',        // Color for keys in hashes
 *       dashColor: 'red',         // Color for the dashes in arrays
 *       defaultIndentation: 2     // Indentation on nested objects
 *     }
 */
export function renderString(data, options, indentation) {
  let output = "";
  let parsedData;
  // If the input is not a string or if it's empty, just return an empty string
  if (typeof data !== "string" || data === "") {
    return "";
  }

  // Remove non-JSON characters from the beginning string
  if (data[0] !== "{" && data[0] !== "[") {
    let beginingOfJson;
    if (data.indexOf("{") === -1) {
      beginingOfJson = data.indexOf("[");
    } else if (data.indexOf("[") === -1) {
      beginingOfJson = data.indexOf("{");
    } else if (data.indexOf("{") < data.indexOf("[")) {
      beginingOfJson = data.indexOf("{");
    } else {
      beginingOfJson = data.indexOf("[");
    }
    output += `${data.substr(0, beginingOfJson)}\n`;
    data = data.substr(beginingOfJson);
  }

  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    // Return an error in case of an invalid JSON
    return `${chalk.red("Error:")} Not valid JSON!`;
  }

  // Call the real render() method
  output += exports.render(parsedData, options, indentation);
  return output;
};
