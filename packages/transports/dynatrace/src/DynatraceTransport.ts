import { LoggerlessTransport, type LoggerlessTransportConfig, type LogLayerTransportParams } from "@loglayer/transport";

export interface DynatraceTransportConfig extends LoggerlessTransportConfig {
  /**
   * The URL to post logs to. Should be in the format of:
   * - https://<env-id>.live.dynatrace.com/api/v2/logs/ingest
   * - https://{your-activegate-domain}:9999/e/{your-environment-id}/api/v2/logs/ingest
   */
  url: string;

  /**
   * An access token with the logs.ingest scope
   */
  ingestToken: string;

  /**
   * Optional callback for error handling
   */
  onError?: (error: Error | string) => void;
}

export class DynatraceTransport extends LoggerlessTransport {
  private url: string;
  private onError?: (error: Error | string) => void;
  private ingestToken: string;

  constructor(config: DynatraceTransportConfig) {
    super(config);
    this.url = config.url;
    this.onError = config.onError;
    this.ingestToken = config.ingestToken;
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams): any[] {
    // Only use the string messages for content
    const stringMessages = messages.filter((msg) => typeof msg === "string");
    const message = stringMessages.join(" ");

    const payload: Record<string, any> = {
      content: message,
      severity: logLevel,
      timestamp: new Date().toISOString(),
      ...(data && hasData ? data : {}),
    };

    const content = JSON.stringify(payload);

    fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Api-Token ${this.ingestToken}`,
      },
      body: content,
    })
      .then((response) => {
        if (!response.ok) {
          const error = `Failed to send log to Dynatrace: ${response.statusText}`;
          if (this.onError) {
            this.onError(error);
          }
        }
      })
      .catch((error) => {
        if (this.onError) {
          this.onError(error);
        } else {
          console.error("Error sending log to Dynatrace:", error);
        }
      });

    return messages;
  }
}
