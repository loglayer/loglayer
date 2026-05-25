import type { MessageDataType } from "./common.types.js";

/**
 * Arguments from a tagged template literal call: [TemplateStringsArray, ...values]
 */
export type TaggedTemplateArgs = [TemplateStringsArray, ...any[]];

/**
 * Union of tagged template args and regular message args.
 * Used by log methods that accept both syntaxes:
 * - log.info\`Message ${value}\`
 * - log.info("Message", value)
 */
export type TaggedTemplateOrMessageArgs = TaggedTemplateArgs | MessageDataType[];

/**
 * Converts tagged template arguments to a message array.
 * Detects tagged templates by checking for the `raw` property on TemplateStringsArray.
 */
export function resolveMessages(args: any[]): MessageDataType[] {
  const first = args[0];
  if (Array.isArray(first) && typeof (first as unknown as { raw?: unknown }).raw !== "undefined") {
    const strings = first as unknown as TemplateStringsArray;
    const values = args.slice(1);
    let result = "";
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];
      if (i < values.length) {
        result += String(values[i]);
      }
    }
    return [result];
  }
  return args as MessageDataType[];
}
