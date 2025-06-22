import chalk from "chalk";
import type { SimplePrettyTerminalTheme } from "./types.js";

/**
 * Moonlight - A dark theme with cool blue tones
 * Inspired by moonlit nights and modern IDEs
 *
 * Color Palette:
 * - Primary: Cool blues and soft greens
 * - Accents: Warm yellows and soft reds
 * - Background: Assumes dark terminal (black or very dark grey)
 *
 * Best used with:
 * - Dark terminal themes
 * - Night-time coding sessions
 * - Environments where eye strain is a concern
 */
export const moonlight: SimplePrettyTerminalTheme = {
  colors: {
    trace: chalk.rgb(114, 135, 153), // Muted blue-grey for less important info
    debug: chalk.rgb(130, 170, 255), // Soft blue that pops but doesn't strain
    info: chalk.rgb(195, 232, 141), // Sage green for good readability
    warn: chalk.rgb(255, 203, 107), // Warm yellow, less harsh than pure yellow
    error: chalk.rgb(247, 118, 142), // Soft red that stands out without being aggressive
    fatal: chalk.bgRgb(247, 118, 142).white, // Inverted soft red for maximum visibility
  },
  logIdColor: chalk.rgb(84, 98, 117), // Darker blue-grey for secondary information
  dataValueColor: chalk.rgb(209, 219, 231), // Light grey-blue for primary content
  dataKeyColor: chalk.rgb(130, 170, 255), // Matching debug blue for consistency
};

/**
 * Sunlight - A light theme with warm tones
 * Inspired by daylight reading and paper documentation
 *
 * Color Palette:
 * - Primary: Deep, rich colors that contrast well with white
 * - Accents: Earth tones and deep jewel tones
 * - Background: Assumes light terminal (white or very light grey)
 *
 * Best used with:
 * - Light terminal themes
 * - Daytime coding sessions
 * - High-glare environments
 * - Printed documentation
 */
export const sunlight: SimplePrettyTerminalTheme = {
  colors: {
    trace: chalk.rgb(110, 110, 110), // Dark grey for subtle information
    debug: chalk.rgb(32, 96, 159), // Deep blue for strong contrast on white
    info: chalk.rgb(35, 134, 54), // Forest green, easier on the eyes than bright green
    warn: chalk.rgb(176, 95, 0), // Brown-orange for natural warning color
    error: chalk.rgb(191, 0, 0), // Deep red for clear visibility on light backgrounds
    fatal: chalk.bgRgb(191, 0, 0).white, // White on deep red for critical issues
  },
  logIdColor: chalk.rgb(110, 110, 110),
  dataValueColor: chalk.rgb(0, 0, 0),
  dataKeyColor: chalk.rgb(32, 96, 159),
};

/**
 * Neon - A dark theme with vibrant cyberpunk colors
 * Inspired by neon-lit cityscapes and retro-futuristic aesthetics
 *
 * Color Palette:
 * - Primary: Electric blues and hot pinks
 * - Accents: Bright purples and cyber greens
 * - Background: Assumes dark terminal (black or very dark grey)
 *
 * Best used with:
 * - Dark terminal themes
 * - High-contrast preferences
 * - Modern, tech-focused applications
 */
export const neon: SimplePrettyTerminalTheme = {
  colors: {
    trace: chalk.rgb(108, 108, 255), // Electric blue
    debug: chalk.rgb(255, 82, 246), // Hot pink
    info: chalk.rgb(0, 255, 163), // Cyber green
    warn: chalk.rgb(255, 231, 46), // Electric yellow
    error: chalk.rgb(255, 53, 91), // Neon red
    fatal: chalk.bgRgb(255, 53, 91).rgb(0, 255, 163), // Neon red bg with cyber green text
  },
  logIdColor: chalk.rgb(187, 134, 252), // Bright purple
  dataValueColor: chalk.rgb(255, 255, 255), // Pure white
  dataKeyColor: chalk.rgb(0, 255, 240), // Cyan
};

/**
 * Nature - A light theme with organic, earthy colors
 * Inspired by forest landscapes and natural elements
 *
 * Color Palette:
 * - Primary: Deep forest greens and rich browns
 * - Accents: Autumn reds and golden yellows
 * - Background: Assumes light terminal (white or very light grey)
 *
 * Best used with:
 * - Light terminal themes
 * - Nature-inspired interfaces
 * - Applications focusing on readability
 */
export const nature: SimplePrettyTerminalTheme = {
  colors: {
    trace: chalk.rgb(101, 115, 126), // Slate grey
    debug: chalk.rgb(34, 139, 34), // Forest green
    info: chalk.rgb(46, 139, 87), // Sea green
    warn: chalk.rgb(218, 165, 32), // Golden rod
    error: chalk.rgb(139, 69, 19), // Saddle brown
    fatal: chalk.bgRgb(139, 69, 19).white, // Brown background with white text
  },
  logIdColor: chalk.rgb(101, 115, 126),
  dataValueColor: chalk.rgb(0, 0, 0),
  dataKeyColor: chalk.rgb(34, 139, 34),
};

/**
 * Pastel - A soft, calming theme with gentle colors
 * Inspired by watercolor paintings and soft aesthetics
 *
 * Color Palette:
 * - Primary: Soft pastels and muted tones
 * - Accents: Gentle pinks and light blues
 * - Background: Assumes light terminal (white or very light grey)
 *
 * Best used with:
 * - Light terminal themes
 * - Long coding sessions
 * - Reduced visual stress
 */
export const pastel: SimplePrettyTerminalTheme = {
  colors: {
    trace: chalk.rgb(200, 200, 200), // Light grey
    debug: chalk.rgb(173, 216, 230), // Light blue
    info: chalk.rgb(144, 238, 144), // Light green
    warn: chalk.rgb(255, 218, 185), // Peach
    error: chalk.rgb(255, 182, 193), // Light pink
    fatal: chalk.bgRgb(255, 182, 193).rgb(105, 105, 105), // Light pink bg with dim grey text
  },
  logIdColor: chalk.rgb(200, 200, 200),
  dataValueColor: chalk.rgb(105, 105, 105),
  dataKeyColor: chalk.rgb(173, 216, 230),
};
