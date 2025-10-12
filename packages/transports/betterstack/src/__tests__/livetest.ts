// Load environment variables
// Set BETTERSTACK_SOURCE_TOKEN and optionally BETTERSTACK_INGESTION_HOST in your .env file
// The ingestion host should be the hostname only (e.g., "in.logs.betterstack.com")
// The transport will automatically add "https://" prefix
import { config } from "dotenv";
import { LogLayer } from "loglayer";
import { BetterStackTransport } from "../BetterStackTransport.js";

config();

async function testBetterStackTransport() {
  const sourceToken = process.env.BETTERSTACK_SOURCE_TOKEN;
  const ingestionHost = process.env.BETTERSTACK_INGESTION_HOST;

  if (!sourceToken) {
    console.log("Skipping Better Stack live test - BETTERSTACK_SOURCE_TOKEN not set");
    return;
  }

  // Note: Add "https://" in front of the ingestion host from Better Stack
  const url = `https://${ingestionHost}`;

  const transport = new BetterStackTransport({
    sourceToken,
    url,
    // Disable batch sending for live test to see immediate results
    enableBatchSend: false,
    onError: (error) => {
      console.error("Better Stack transport error:", error);
    },
    onDebug: (entry) => {
      console.log("Better Stack transport debug:", entry);
    },
  });

  const log = new LogLayer({ transport });

  console.log("Testing Better Stack transport...");

  // Test basic logging
  log.info("Hello from Better Stack transport!");
  log.warn("This is a warning message");
  log.error("This is an error message");

  // Test with metadata
  log.withMetadata({ userId: "123", action: "test" }).info("User action logged");

  // Test with error
  log.withError(new Error("Test error")).error("Error occurred");

  // Test complex metadata
  log
    .withMetadata({
      requestId: "req-123",
      duration: 150,
      tags: ["api", "test"],
      nested: {
        data: "value",
        count: 42,
      },
    })
    .info("Complex metadata test");

  // Wait a bit for the requests to complete
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("Better Stack transport test completed!");
}

// Run the test
testBetterStackTransport().catch(console.error);
