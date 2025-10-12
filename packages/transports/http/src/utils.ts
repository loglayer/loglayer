import { HttpTransportError, RateLimitError } from "./errors.js";

/**
 * Compresses data using gzip compression
 */
export async function compressData(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);

  // Use the CompressionStream API if available (modern browsers)
  if (typeof CompressionStream !== "undefined") {
    const stream = new CompressionStream("gzip");
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    await writer.write(dataBytes);
    await writer.close();

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  // Fallback for Node.js or environments without CompressionStream
  // In a real implementation, you might want to use a library like 'zlib' for Node.js
  throw new Error("Gzip compression not supported in this environment");
}

/**
 * Sends HTTP request with retry logic and rate limiting
 */
export async function sendWithRetry(
  url: string,
  method: string,
  headers: Record<string, string>,
  payload: string | Uint8Array,
  maxRetries: number,
  retryDelay: number,
  respectRateLimit = true,
  onDebugReqRes?: (reqRes: {
    req: { url: string; method: string; headers: Record<string, string>; body: string | Uint8Array };
    res: { status: number; statusText: string; headers: Record<string, string>; body: string };
  }) => void,
  onError?: (err: Error) => void,
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: payload,
      });

      // Call debug callback if provided
      if (onDebugReqRes) {
        try {
          const responseBody = await response.clone().text();
          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });

          onDebugReqRes({
            req: {
              url,
              method,
              headers,
              body: payload,
            },
            res: {
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders,
              body: responseBody,
            },
          });
        } catch (debugError) {
          // Don't let debug callback errors break the main flow
          if (onError) {
            onError(new Error(`Debug callback error: ${debugError}`));
          }
        }
      }

      // Handle rate limiting
      if (response.status === 429 && respectRateLimit) {
        const retryAfter = response.headers.get("retry-after");
        const waitTime = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : retryDelay;

        throw new RateLimitError(`Rate limit exceeded. Retry after ${waitTime}ms`, waitTime);
      }

      // Check for non-2xx status codes and log if onError is enabled
      if (response.status < 200 || response.status >= 300) {
        if (onError) {
          onError(new Error(`HTTP request failed with status ${response.status}: ${response.statusText}`));
        }
      }

      // Handle other errors
      if (!response.ok) {
        throw new HttpTransportError(`HTTP ${response.status}: ${response.statusText}`, response.status, response);
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // If it's a rate limit error and we should respect it, wait and retry
      if (error instanceof RateLimitError && respectRateLimit) {
        await new Promise((resolve) => setTimeout(resolve, error.retryAfter));
        continue;
      }

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const waitTime = retryDelay * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}
