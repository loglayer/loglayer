import type { MockLogLayer } from "loglayer";

export function augmentMockLogLayer(prototype: typeof MockLogLayer.prototype): void {
  // statsIncrement
  prototype.statsIncrement = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;

  // statsDecrement
  prototype.statsDecrement = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;

  // statsTiming
  prototype.statsTiming = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;

  // statsTimer - wraps the function and executes it without sending stats
  prototype.statsTimer = ((fn: any, _stat?: string, _tags?: any[]): any => {
    return fn;
  }) as any;

  // statsAsyncTimer - wraps the async function and executes it without sending stats
  prototype.statsAsyncTimer = ((fn: any, _stat?: string, _tags?: any[]): any => {
    return fn;
  }) as any;

  // statsAsyncDistTimer - wraps the async function and executes it without sending stats
  prototype.statsAsyncDistTimer = ((fn: any, _stat?: string, _tags?: any[]): any => {
    return fn;
  }) as any;

  // statsHistogram
  prototype.statsHistogram = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;

  // statsDistribution
  prototype.statsDistribution = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;

  // statsGauge
  prototype.statsGauge = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;

  // statsGaugeDelta
  prototype.statsGaugeDelta = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;

  // statsSet
  prototype.statsSet = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;

  // statsUnique
  prototype.statsUnique = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;

  // statsCheck
  prototype.statsCheck = function (this: MockLogLayer, ..._args: any[]): MockLogLayer {
    return this;
  } as any;
}
