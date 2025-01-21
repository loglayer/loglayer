import { Axiom } from "@axiomhq/js";
import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import { AxiomTransport } from "../AxiomTransport.js";

process.env.AXIOM_TOKEN = "xaat-311bf65b-885d-464a-bed8-f8a36476e61d";

async function main() {
  if (!process.env.AXIOM_TOKEN) {
    console.log("Skipping live test - AXIOM_TOKEN not set");
    return;
  }

  // Create the Axiom client
  const axiom = new Axiom({
    token: process.env.AXIOM_TOKEN,
  });

  // Create the transport with the Axiom client
  const transport = new AxiomTransport({
    logger: axiom,
    dataset: "test-loglayer",
  });

  // Create the logger
  const logger = new LogLayer({
    transport,
  });

  testTransportOutput("axiom", logger);

  // Cleanup (this will also flush remaining logs)
  await transport[Symbol.dispose]();
}

main().catch((error) => {
  console.error("Live test failed:", error);
  process.exit(1);
});
