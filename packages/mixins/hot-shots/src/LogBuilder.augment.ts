import type { StatsD } from "hot-shots";
import "./types.js"; // Import types to ensure declarations are processed

// Store the hot-shots client - set during mixin registration
let statsClient: StatsD | null = null;

/**
 * Set the hot-shots client for the mixin.
 * Called during mixin registration.
 *
 * @param client - The hot-shots StatsD client instance
 */
export function setStatsClient(client: StatsD): void {
  statsClient = client;
}

/**
 * Get the hot-shots client, creating a mock one if not set.
 * Returns a no-op mock client if no client has been configured,
 * allowing the mixin to work even without a client configured.
 *
 * @returns The hot-shots StatsD client instance (or a mock if not configured)
 */
export function getStatsClient(): StatsD {
  if (!statsClient) {
    // Return a no-op mock client if not configured
    // This allows the mixin to work even without a client configured
    return {
      increment: () => {},
      decrement: () => {},
      gauge: () => {},
      gaugeDelta: () => {},
      histogram: () => {},
      distribution: () => {},
      timing: () => {},
      set: () => {},
      unique: () => {},
      event: () => {},
      check: () => {},
    } as unknown as StatsD;
  }
  return statsClient;
}
