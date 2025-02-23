import chalk from "chalk";
import truncate from "cli-truncate";
import type { ColorConfig, ViewConfig } from "../types.js";
import * as prettyjson from "../vendor/prettyjson.js";

/**
 * Formats a timestamp into a human-readable string.
 * Format: HH:MM:SS.mmm
 */
export function formatTimestamp(timestamp: number, colorFn: (inp: string) => string): string {
  const date = new Date(timestamp);
  return colorFn(
    `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date.getMilliseconds().toString().padStart(3, "0")}`,
  );
}

/**
 * Gets the color function for a log level.
 */
export function getLevelColor(level: string, colors: ColorConfig): typeof chalk.white {
  return colors[level] || chalk.white;
}

/**
 * Formats a value for display.
 */
export function formatValue(value: any, expanded = false): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return value.toString();
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return expanded ? JSON.stringify(value) : "[...]";
  if (typeof value === "object") return expanded ? JSON.stringify(value) : "{...}";
  return value.toString();
}

/**
 * Formats structured data for inline display with depth limiting.
 */
export function formatInlineData(
  data: any,
  config: ViewConfig,
  maxDepth: number,
  maxLength: number,
  expanded = false,
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
        pairs.push(`${config.dataKeyColor(fullKey)}=${config.dataValueColor(formatValue(value, expanded))}`);
      }
    }
  };

  traverse(data);
  const result = pairs.join(" ");
  return expanded ? result : truncate(result, maxLength);
}

/**
 * Formats structured data for selection view (shows full data).
 */
export function formatSelectionData(data: any, config: ViewConfig): string {
  if (!data) return "";

  return prettyjson.render(data, {
    keysColor: config.dataKeyColor,
    dashColor: config.dataKeyColor,
    stringColor: config.dataValueColor,
    numberColor: config.dataValueColor,
    booleanColor: config.dataValueColor,
    nullUndefinedColor: config.dataValueColor,
    defaultIndentation: 2,
  });
}
