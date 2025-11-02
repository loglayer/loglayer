import type { LogLayer } from "loglayer";
import { getStatsDClient } from "./client.js";

export function augmentLogLayer(prototype: typeof LogLayer.prototype): void {
  const client = getStatsDClient();

  // statsIncrement
  prototype.statsIncrement = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.increment as any)(...args);
    return this;
  } as any;

  // statsDecrement
  prototype.statsDecrement = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.decrement as any)(...args);
    return this;
  } as any;

  // statsTiming
  prototype.statsTiming = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.timing as any)(...args);
    return this;
  } as any;

  // statsTimer
  prototype.statsTimer = ((...args: any[]): any => (client.timer as any)(...args)) as any;

  // statsAsyncTimer
  prototype.statsAsyncTimer = ((...args: any[]): any => (client.asyncTimer as any)(...args)) as any;

  // statsAsyncDistTimer
  prototype.statsAsyncDistTimer = ((...args: any[]): any => (client.asyncDistTimer as any)(...args)) as any;

  // statsHistogram
  prototype.statsHistogram = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.histogram as any)(...args);
    return this;
  } as any;

  // statsDistribution
  prototype.statsDistribution = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.distribution as any)(...args);
    return this;
  } as any;

  // statsGauge
  prototype.statsGauge = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.gauge as any)(...args);
    return this;
  } as any;

  // statsGaugeDelta
  prototype.statsGaugeDelta = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.gaugeDelta as any)(...args);
    return this;
  } as any;

  // statsSet
  prototype.statsSet = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.set as any)(...args);
    return this;
  } as any;

  // statsUnique
  prototype.statsUnique = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.unique as any)(...args);
    return this;
  } as any;

  // statsCheck
  prototype.statsCheck = function (this: LogLayer, ...args: any[]): LogLayer {
    (client.check as any)(...args);
    return this;
  } as any;
}
