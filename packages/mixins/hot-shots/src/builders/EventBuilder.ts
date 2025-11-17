import type { StatsD } from "hot-shots";
import { CommonStatsBuilder } from "../CommonStatsBuilder.js";
import type { IEventBuilder } from "../types.js";

/**
 * Builder for the event method (DataDog only).
 * Supports chaining with withText(), withTags(), and withCallback().
 */
export class EventBuilder extends CommonStatsBuilder implements IEventBuilder {
  /** The event title */
  private readonly title: string;
  /** The event text/description */
  private text?: string;

  /**
   * Creates a new EventBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param title - The event title
   */
  constructor(client: StatsD, title: string) {
    super(client);
    this.title = title;
  }

  /**
   * Set the event text/description.
   *
   * @param text - The event text/description
   * @returns The builder instance for method chaining
   */
  withText(text: string): IEventBuilder {
    this.text = text;
    return this;
  }

  /**
   * Send the event with the configured options.
   */
  send(): void {
    // event(title, text?, options?, tags?, callback?)
    const finalTags = this.convertTags();

    // If we have tags, use the overload: event(title, text?, options?, tags?, callback?)
    // We need to pass undefined for options to get to the tags parameter
    if (finalTags) {
      this.client.event(
        this.title,
        this.text,
        undefined, // options
        finalTags,
        this.callback,
      );
    } else if (this.callback) {
      // If no tags but we have a callback, use: event(title, text?, options?, callback?)
      this.client.event(
        this.title,
        this.text,
        undefined, // options
        this.callback,
      );
    } else if (this.text !== undefined) {
      // If no tags and no callback but we have text, use: event(title, text?)
      this.client.event(this.title, this.text);
    } else {
      // If no tags, no callback, and no text, use: event(title)
      this.client.event(this.title);
    }
  }
}
