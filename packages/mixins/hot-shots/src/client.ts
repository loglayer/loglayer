import type { StatsD } from "hot-shots";

let client: StatsD | null = null;

export function setStatsDClient(c: StatsD | null) {
  client = c;
}

export function getStatsDClient() {
  return client;
}
