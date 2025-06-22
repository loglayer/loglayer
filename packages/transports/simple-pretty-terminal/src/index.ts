import { SimplePrettyTerminalTransport } from "./SimplePrettyTerminalTransport.js";
import type { PrettyTerminalViewMode, SimplePrettyTerminalConfig, SimplePrettyTerminalTheme } from "./types.js";

// Export chalk for custom theme creation
export * from "chalk";

// Export the main transport class (for advanced usage)
export { SimplePrettyTerminalTransport };

// Export all built-in themes
export * from "./themes.js";

// Export essential types for configuration and custom themes
export type { SimplePrettyTerminalConfig, SimplePrettyTerminalTheme, PrettyTerminalViewMode };

// Main convenience function for creating the transport
export function getSimplePrettyTerminal(config: SimplePrettyTerminalConfig = {}) {
  return new SimplePrettyTerminalTransport(config);
}
