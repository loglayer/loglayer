import chalk from "chalk";
import { format } from "date-fns";
import type { ColorConfig, ViewConfig } from "../types.js";

/**
 * Formats a timestamp into a readable string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param colorFn - Chalk function to color the timestamp
 * @param timestampFormat - Custom format string (date-fns) or function. Defaults to "HH:mm:ss.SSS"
 * @returns Formatted timestamp string
 */
export function formatTimestamp(
  timestamp: number,
  colorFn: typeof chalk.white,
  timestampFormat: string | ((timestamp: number) => string) = "HH:mm:ss.SSS",
): string {
  let formattedTime: string;

  if (typeof timestampFormat === "function") {
    formattedTime = timestampFormat(timestamp);
  } else {
    const date = new Date(timestamp);
    formattedTime = format(date, timestampFormat);
  }

  return colorFn(`[${formattedTime}]`);
}

/**
 * Gets the appropriate color function for a log level.
 *
 * @param level - Log level string
 * @param colors - Color configuration object
 * @returns Chalk function for the log level
 */
export function getLevelColor(level: string, colors: ColorConfig): typeof chalk.white {
  const levelLower = level.toLowerCase();

  switch (levelLower) {
    case "trace":
      return colors.trace || chalk.white;
    case "debug":
      return colors.debug || chalk.white;
    case "info":
      return colors.info || chalk.white;
    case "warn":
      return colors.warn || chalk.white;
    case "error":
      return colors.error || chalk.white;
    case "fatal":
      return colors.fatal || chalk.white;
    default:
      return colors.info || chalk.white;
  }
}

/**
 * Formats a value for display.
 */
export function formatValue(value: any, expanded = false, collapseArrays = true): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return value.toString();
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return expanded ? JSON.stringify(value) : collapseArrays ? "[...]" : value.toString();
  if (typeof value === "object") return expanded ? JSON.stringify(value) : "{...}";
  return value.toString();
}

/**
 * Formats structured data for inline display with depth limiting.
 *
 * @param data - The data to format
 * @param config - View configuration for colors
 * @param maxDepth - Maximum depth for nested objects
 * @param expanded - Whether to show full depth (for inline view mode)
 * @param collapseArrays - Whether to collapse arrays to summary format
 * @returns Formatted data string
 */
export function formatInlineData(
  data: any,
  config: Required<ViewConfig>,
  maxDepth: number,
  expanded = false,
  collapseArrays = true,
): string {
  if (!data) return "";

  const pairs: string[] = [];
  const traverse = (obj: any, prefix = "", depth = 0) => {
    if (!expanded && depth >= maxDepth) return;

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (expanded) {
          pairs.push(`${config.dataKeyColor(fullKey)}=${config.dataValueColor(JSON.stringify(value))}`);
        } else {
          traverse(value, fullKey, depth + 1);
        }
      } else {
        pairs.push(
          `${config.dataKeyColor(fullKey)}=${config.dataValueColor(formatValue(value, expanded, collapseArrays))}`,
        );
      }
    }
  };

  traverse(data);
  const result = pairs.join(" ");
  // Remove truncation - inline view should show complete data without truncation
  return result;
}
