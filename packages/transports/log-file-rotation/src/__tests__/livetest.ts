import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LogLayer } from "loglayer";
import { LogFileRotationTransport } from "../LogFileRotationTransport.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "live-logs");

// Ensure log directory exists and is clean
await rm(LOG_DIR, { recursive: true, force: true });
await mkdir(LOG_DIR, { recursive: true });

// Common callbacks for all transports
const callbacks = {
  onRotate: (oldFile: string, newFile: string) => {
    console.log(
      "\x1b[36m%s\x1b[0m",
      `[Rotation] Log rotated from ${path.basename(oldFile)} to ${path.basename(newFile)}`,
    );
  },
  onNew: (newFile: string) => {
    console.log("\x1b[32m%s\x1b[0m", `[New] Log file created: ${path.basename(newFile)}`);
  },
  onLogRemoved: (info: { date: number; name: string; hash: string }) => {
    console.log("\x1b[33m%s\x1b[0m", `[Removed] Log file removed: ${info.name} (${new Date(info.date).toISOString()})`);
  },
  onError: (error: Error) => {
    console.error("\x1b[31m%s\x1b[0m", "[Error] Log rotation error:", error);
  },
  onOpen: () => {
    console.log("\x1b[32m%s\x1b[0m", "[Open] Log file opened");
  },
  onClose: () => {
    console.log("\x1b[33m%s\x1b[0m", "[Close] Log file closed");
  },
  onFinish: () => {
    console.log("\x1b[33m%s\x1b[0m", "[Finish] Stream finished");
  },
};

// Create different transport configurations to demonstrate various rotation scenarios
const transports = [
  // 1. Daily rotation with YMD format
  new LogFileRotationTransport({
    filename: path.join(LOG_DIR, "daily", "test-%DATE%.log"),
    frequency: "daily",
    dateFormat: "YMD", // Required for daily rotation
    verbose: true,
    callbacks,
  }),

  // 2. Hourly rotation with YMDHm format
  new LogFileRotationTransport({
    filename: path.join(LOG_DIR, "hourly", "test-%DATE%.log"),
    frequency: "1h",
    dateFormat: "YMDHm", // Required for hourly rotation
    verbose: true,
    callbacks,
  }),

  // 3. Minute rotation with YMDHm format
  new LogFileRotationTransport({
    filename: path.join(LOG_DIR, "minutes", "test-%DATE%.log"),
    frequency: "5m",
    dateFormat: "YMDHm", // Required for minute rotation
    verbose: true,
    callbacks,
  }),

  // 4. Size-based rotation (no date format needed)
  new LogFileRotationTransport({
    filename: path.join(LOG_DIR, "size", "app.log"),
    size: "50k",
    maxLogs: 5,
    verbose: true,
    callbacks,
  }),

  // 5. Combined size and date rotation
  new LogFileRotationTransport({
    filename: path.join(LOG_DIR, "combined", "app-%DATE%.log"),
    frequency: "daily",
    dateFormat: "YMD", // Required for daily rotation
    size: "50k",
    maxLogs: "5",
    verbose: true,
    callbacks,
  }),
];

// Create a logger instance with all transports
const logger = new LogLayer({
  transport: transports,
});

// Function to generate random log messages
function generateRandomLog() {
  const levels = ["info", "warn", "error", "debug"] as const;
  const level = levels[Math.floor(Math.random() * levels.length)];
  const userId = Math.floor(Math.random() * 1000).toString();
  const requestId = Math.random().toString(36).substring(7);

  logger
    .withMetadata({
      userId,
      requestId,
      timestamp: new Date().toISOString(),
      duration: Math.random() * 1000,
      status: Math.random() > 0.9 ? "error" : "success",
    })
    [level](`User ${userId} performed action`);
}

// Generate logs continuously
console.log("\x1b[35m%s\x1b[0m", "Starting log generation...");
console.log("\x1b[35m%s\x1b[0m", "Press Ctrl+C to stop");

// Generate a log every 100ms
const interval = setInterval(generateRandomLog, 100);

// Handle process termination
process.on("SIGINT", () => {
  clearInterval(interval);
  console.log("\n\x1b[35m%s\x1b[0m", "Stopping log generation...");
  // The transport will automatically flush any remaining logs
  process.exit(0);
});
