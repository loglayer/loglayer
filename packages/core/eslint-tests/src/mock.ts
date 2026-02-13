/**
 * Tests that MockLogLayer methods all return void.
 */
import { LogLevel, MockLogLayer } from "loglayer";

function testMockLogLayer() {
  const mock = new MockLogLayer();

  mock.info("mock info");
  mock.warn("mock warn");
  mock.error("mock error");
  mock.debug("mock debug");
  mock.trace("mock trace");
  mock.fatal("mock fatal");

  mock.errorOnly(new Error("mock error"));
  mock.metadataOnly({ key: "value" });
  mock.raw({ logLevel: LogLevel.info, messages: ["mock raw"] });

  mock.withMetadata({ key: "value" }).info("mock metadata");
  mock.withError(new Error("test")).error("mock error");

  mock.withContext({ key: "value" });
  mock.clearContext();
  mock.enableLogging();
  mock.disableLogging();
  mock.child().info("mock child");
  mock.muteContext();
  mock.unMuteContext();
  mock.muteMetadata();
  mock.unMuteMetadata();
  mock.withPrefix("[MOCK]");
  mock.setLevel("info");
  mock.enableIndividualLevel("debug");
  mock.disableIndividualLevel("trace");
  mock.isLevelEnabled("info");
}

testMockLogLayer();
