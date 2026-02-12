import type { BufferedMetricsLogger } from "datadog-metrics";
import "./types.js"; // Import types to ensure declarations are processed

// Store the datadog-metrics client - set during mixin registration
let metricsClient: BufferedMetricsLogger | null = null;

/**
 * Set the datadog-metrics client for the mixin.
 * Called during mixin registration.
 *
 * @param client - The BufferedMetricsLogger instance
 */
export function setMetricsClient(client: BufferedMetricsLogger | null): void {
  metricsClient = client;
}

/**
 * Check if the client is null (no-op mode)
 *
 * @returns True if the client is null, false otherwise
 */
export function isNoOpClient(): boolean {
  return metricsClient === null;
}

/**
 * Get the datadog-metrics client.
 * Returns the configured client or null if not configured.
 *
 * @returns The BufferedMetricsLogger instance or null
 */
export function getMetricsClient(): BufferedMetricsLogger | null {
  return metricsClient;
}
