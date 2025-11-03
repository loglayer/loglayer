import type { LogLayer } from "loglayer";
import { getStatsDClient } from "./client.js";

export function augmentLogLayer(prototype: typeof LogLayer.prototype): void {
  // statsIncrement
  prototype.statsIncrement = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.increment as any)(...args);
    }
    return this;
  } as any;

  // statsDecrement
  prototype.statsDecrement = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.decrement as any)(...args);
    }
    return this;
  } as any;

  // statsTiming
  prototype.statsTiming = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.timing as any)(...args);
    }
    return this;
  } as any;

  // statsTimer
  prototype.statsTimer = ((...args: any[]): any => {
    const client = getStatsDClient();
    if (client) {
      return (client.timer as any)(...args);
    }
    return args[0]; // Return the function if client is null
  }) as any;

  // statsAsyncTimer
  prototype.statsAsyncTimer = ((...args: any[]): any => {
    const client = getStatsDClient();
    if (client) {
      return (client.asyncTimer as any)(...args);
    }
    return args[0]; // Return the function if client is null
  }) as any;

  // statsAsyncDistTimer
  prototype.statsAsyncDistTimer = ((...args: any[]): any => {
    const client = getStatsDClient();
    if (client) {
      return (client.asyncDistTimer as any)(...args);
    }
    return args[0]; // Return the function if client is null
  }) as any;

  // statsHistogram
  prototype.statsHistogram = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.histogram as any)(...args);
    }
    return this;
  } as any;

  // statsDistribution
  prototype.statsDistribution = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.distribution as any)(...args);
    }
    return this;
  } as any;

  // statsGauge
  prototype.statsGauge = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.gauge as any)(...args);
    }
    return this;
  } as any;

  // statsGaugeDelta
  prototype.statsGaugeDelta = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.gaugeDelta as any)(...args);
    }
    return this;
  } as any;

  // statsSet
  prototype.statsSet = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.set as any)(...args);
    }
    return this;
  } as any;

  // statsUnique
  prototype.statsUnique = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.unique as any)(...args);
    }
    return this;
  } as any;

  // statsCheck
  prototype.statsCheck = function (this: LogLayer, ...args: any[]): LogLayer {
    const client = getStatsDClient();
    if (client) {
      (client.check as any)(...args);
    }
    return this;
  } as any;
}
