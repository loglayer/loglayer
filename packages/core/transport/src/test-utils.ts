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

  console.log("\n===== withMetadata() ====");
  logLayerInstance
    .withMetadata({
      test: "metadata",
      test2: "metadata2",
    })
    .trace("trace message");

  console.log("\n===== withError() ====");
  logLayerInstance.withError(new Error("error object")).trace("trace message");

  console.log("\n===== withError() + withMetadata() ====");
  logLayerInstance
    .withMetadata({
      test: "metadata",
      test2: "metadata2",
    })
    .withError(new Error("error object"))
    .error("error message");

  console.log("\n===== onlyError() ====");
  logLayerInstance.errorOnly(new Error("error message"));

  console.log("\n===== onlyMetadata() ====");
  logLayerInstance.metadataOnly({
    only: "metadata",
  });

  console.log("\n===== withContext() ====");
  logLayerInstance.withContext({
    test: "data",
  });

  logLayerInstance.info("context data");

  console.log(`\n===== End Livetest for: ${label} =====`);
}
