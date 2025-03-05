/**
 * Shows what the logging library output looks like under a transport
 * @param label A name for the test
 * @param logLayerInstance The loglayer instance to use for logging
 */
export function testTransportOutput(label: string, logLayerInstance: any) {
  console.log(`\n===== Start Livetest for: ${label} =====`);
  console.log("\n===== info() ====");
  logLayerInstance.info("info message");

  console.log("\n===== warn() ====");
  logLayerInstance.warn("warn message");

  console.log("\n===== error() ====");
  logLayerInstance.error("error message");

  console.log("\n===== debug() ====");
  logLayerInstance.debug("debug message");

  console.log("\n===== trace() ====");
  logLayerInstance.trace("trace message");

  console.log("\n===== fatal() ====");
  logLayerInstance.fatal("fatal message");

  console.log("\n===== multiple parameters ====");
  logLayerInstance.info("multiple info message", "with multiple", "parameters");

  console.log("\n===== multiple parameters with mixed data ====");
  logLayerInstance.info("mixed data", 1234, undefined, null, true);

  console.log("\n===== withMetadata() ====");
  logLayerInstance
    .withMetadata({
      test: "metadata",
      test2: "metadata2",
    })
    .trace("trace message with metadata");

  console.log("\n===== withError() ====");
  logLayerInstance.withError(new Error("error object")).trace("trace message with error");

  console.log("\n===== withError() + withMetadata() ====");
  logLayerInstance
    .withMetadata({
      test: "metadata",
      test2: "metadata2",
      nested: {
        data: "nested data",
      },
    })
    .withError(new Error("error object"))
    .error("error message with metadata and error instance");

  console.log("\n===== onlyError() ====");
  logLayerInstance.errorOnly(new Error("error message"));

  console.log("\n===== onlyMetadata() ====");
  logLayerInstance.metadataOnly({
    only: "metadata",
    arrayData: [1, 2, 3],
  });

  console.log("\n===== withContext() ====");
  logLayerInstance.withContext({
    test: "data",
  });

  logLayerInstance.info("context data");

  console.log(`\n===== End Livetest for: ${label} =====`);
}
