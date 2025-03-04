import { describe, expect, it, vi } from "vitest";
import { MockLogBuilder } from "../MockLogBuilder.js";
import { MockLogLayer } from "../MockLogLayer.js";

describe("MockLogLayer tests", () => {
  it("should be able to mock a log message method", () => {
    const logger = new MockLogLayer();
    logger.info = vi.fn();
    logger.info("testing");
    expect(logger.info).toBeCalledWith("testing");
  });

  it("should be able to spy on a log message method", () => {
    const logger = new MockLogLayer();
    const infoSpy = vi.spyOn(logger, "info");
    logger.info("testing");
    expect(infoSpy).toBeCalledWith("testing");
  });

  it("should be able to spy on a chained log message method", () => {
    const logger = new MockLogLayer();

    // Get the mock builder instance
    const builder = logger.getMockLogBuilder();

    const infoSpy = vi.spyOn(builder, "info");

    logger.withMetadata({ test: "test" }).info("testing");

    expect(infoSpy).toBeCalledWith("testing");
  });

  it("should be able to mock a log message method when using withMetadata", () => {
    const logger = new MockLogLayer();

    const builder = logger.getMockLogBuilder();

    // to be able to chain withMetadata with info, we need to
    // make sure the withMetadata method returns the builder
    builder.withMetadata = vi.fn().mockReturnValue(builder);
    builder.info = vi.fn();

    logger.withMetadata({ test: "test" }).info("testing");

    expect(builder.withMetadata).toBeCalledWith({ test: "test" });
    expect(builder.info).toBeCalledWith("testing");
  });

  it("should be able to spy on a log message method when using withMetadata", () => {
    const logger = new MockLogLayer();

    const builder = logger.getMockLogBuilder();

    // to be able to chain withMetadata with info, we need to
    // make sure the withMetadata method returns the builder
    const metadataSpy = vi.spyOn(builder, "withMetadata");
    const infoSpy = vi.spyOn(builder, "info");

    logger.withMetadata({ test: "test" }).info("testing");

    expect(metadataSpy).toBeCalledWith({ test: "test" });
    expect(infoSpy).toBeCalledWith("testing");
  });

  it("should be able to spy on a multi-chained log message method", () => {
    const logger = new MockLogLayer();
    const builder = logger.getMockLogBuilder();
    const error = new Error("test error");

    const metadataSpy = vi.spyOn(builder, "withMetadata");
    const errorSpy = vi.spyOn(builder, "withError");
    const infoSpy = vi.spyOn(builder, "info");

    logger.withMetadata({ test: "test" }).withError(error).info("testing");

    expect(metadataSpy).toBeCalledWith({ test: "test" });
    expect(errorSpy).toBeCalledWith(error);
    expect(infoSpy).toBeCalledWith("testing");
  });

  it("should use a custom MockLogBuilder", () => {
    const builder = new MockLogBuilder();
    const logger = new MockLogLayer();

    // Get the mock builder instance
    logger.setMockLogBuilder(builder);

    builder.withMetadata = vi.fn().mockReturnValue(builder);
    builder.info = vi.fn();

    logger.withMetadata({ test: "test" }).info("testing");

    expect(builder.withMetadata).toBeCalledWith({ test: "test" });
    expect(builder.info).toBeCalledWith("testing");
  });

  it("should be able to mock errorOnly", () => {
    const error = new Error("testing");

    const logger = new MockLogLayer();
    logger.errorOnly = vi.fn();
    logger.errorOnly(error);
    expect(logger.errorOnly).toBeCalledWith(error);
  });
});
