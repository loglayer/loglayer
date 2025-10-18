import type { CloudWatchLogsClientConfig } from "@aws-sdk/client-cloudwatch-logs";
import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import { CloudWatchLogsTransport } from "../CloudWatchLogsTransport.js";

const groupName = process.env.CLOUDWATCH_GROUP_NAME || "/loglayer/test";
const streamName = process.env.CLOUDWATCH_STREAM_NAME || "loglayer-stream-test";

// For local testing with localstack, you will need:
// - AWS CLI and AWS Local: https://docs.localstack.cloud/aws/integrations/aws-native-tools/aws-cli/
// - A localstack instance (docker is recommended): https://docs.localstack.cloud/aws/getting-started/installation/
// After setup and starting localstack, try to test the logs and run `awslocal logs get-log-events --log-group-name /loglayer/test --log-stream-name loglayer-stream-test`
// to see the saved logs

const clientConfig: CloudWatchLogsClientConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  endpoint:
    process.env.USE_LOCALSTACK === "true"
      ? process.env.LOCALSTACK_ENDPOINT || "https://localhost.localstack.cloud:4566"
      : undefined,
  credentials: process.env.USE_LOCALSTACK === "true" ? { accessKeyId: "local", secretAccessKey: "stack" } : undefined,
};

const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName,
    streamName,
    clientConfig,
    consoleDebug: true,
    createIfNotExists: true,
  }),
});

testTransportOutput("AWS Lambda PowerTools logger", log);
