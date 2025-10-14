import { testTransportOutput } from "@loglayer/transport";
import * as Sentry from "@sentry/node";
import dotenv from "dotenv";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { SentryTransport } from "../SentryTransport.js";

// This is a live test using Sentry
// It will send logs to a Sentry project using their logger API
// https://docs.sentry.io/platforms/javascript/guides/node/logs/
// You need to create a Sentry account and project to test this

dotenv.config();

if (!process.env.SENTRY_DSN) {
  throw new Error("SENTRY_DSN env var is required");
}

// Initialize Sentry for live testing
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableLogs: true,
});

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new SentryTransport({
    logger: Sentry.logger,
  }),
});

// This will send logs to the configured Sentry project
testTransportOutput("sentry", log);
