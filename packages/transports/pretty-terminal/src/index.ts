import { PrettyTerminalTransport } from "./PrettyTerminalTransport.js";
import type { PrettyTerminalConfig } from "./types.js";

export * as chalk from "chalk";

export * from "./PrettyTerminalTransport.js";
export * from "./themes.js";
export * from "./types.js";

export function getPrettyTerminal(config: PrettyTerminalConfig = {}) {
  return PrettyTerminalTransport.getInstance(config);
}
