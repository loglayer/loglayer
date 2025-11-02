import type { StatsD } from "hot-shots";

let client: StatsD;

export function setStatsDClient(c: StatsD) {
  client = c;
}

export function getStatsDClient() {
  return client;
}
