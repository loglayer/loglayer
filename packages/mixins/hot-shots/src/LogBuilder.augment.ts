import type { StatsD } from "hot-shots";
import { createNoOpStatsClient } from "./MockStatsAPI.js";
import "./types.js"; // Import types to ensure declarations are processed

// Store the hot-shots client - set during mixin registration
let statsClient: StatsD | null = null;

/**
 * Set the hot-shots client for the mixin.
 * Called during mixin registration.
 *
 * @param client - The hot-shots StatsD client instance
 */
export function setStatsClient(client: StatsD | null): void {
  statsClient = client;
}

/**
 * Check if the client is null (no-op mode)
 *
 * @returns True if the client is null, false otherwise
 */
export function isNoOpClient(): boolean {
  return statsClient === null;
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
    return createNoOpStatsClient();
  }
  return statsClient;
}
