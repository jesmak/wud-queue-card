import type { ScrollIndicator } from "./fade";

/** Replaced at build time with the version in package.json. */
declare const __CARD_VERSION__: string;

export const CARD_VERSION = __CARD_VERSION__;

/** A held card's open list, or the lines under the check, show both their fading edges and a thin scrollbar. */
export const DEFAULT_SCROLL_INDICATOR: ScrollIndicator = "both";

/**
 * How long WUD gets to say it has started an install, in milliseconds. It sets `in_progress` as soon
 * as the command arrives, so a minute without it means WUD is down or never got the command.
 */
export const START_TIMEOUT = 60_000;

/**
 * How long a finished install gets for its new version to show, in milliseconds. WUD may unmark the
 * container a moment before it has looked at the new one; see `follow` in containers.ts.
 */
export const VERSION_GRACE = 120_000;

/** How long a row the card has installed stays in the waiting list as updated, in milliseconds. */
export const DONE_KEEP = 600_000;
