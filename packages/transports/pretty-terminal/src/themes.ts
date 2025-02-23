import chalk from "chalk";
import type { PrettyTerminalTheme } from "./types.js";

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
export const moonlight: PrettyTerminalTheme = {
  simpleView: {
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
    selectorColor: chalk.rgb(137, 221, 255), // Ice blue for selection indicators
  },
  detailedView: {
    colors: {
      trace: chalk.rgb(114, 135, 153),
      debug: chalk.rgb(130, 170, 255),
      info: chalk.rgb(195, 232, 141),
      warn: chalk.rgb(255, 203, 107),
      error: chalk.rgb(247, 118, 142),
      fatal: chalk.bgRgb(247, 118, 142).white,
    },
    logIdColor: chalk.rgb(84, 98, 117),
    dataValueColor: chalk.rgb(209, 219, 231),
    dataKeyColor: chalk.rgb(130, 170, 255),
    selectorColor: chalk.rgb(137, 221, 255), // Ice blue for selection indicators
    headerColor: chalk.rgb(137, 221, 255),
    labelColor: chalk.rgb(137, 221, 255).bold,
    separatorColor: chalk.rgb(84, 98, 117),
    jsonColors: {
      keysColor: chalk.rgb(130, 170, 255),
      dashColor: chalk.rgb(209, 219, 231),
      numberColor: chalk.rgb(247, 140, 108),
      stringColor: chalk.rgb(195, 232, 141),
      multilineStringColor: chalk.rgb(195, 232, 141),
      positiveNumberColor: chalk.rgb(195, 232, 141),
      negativeNumberColor: chalk.rgb(247, 118, 142),
      booleanColor: chalk.rgb(255, 203, 107),
      nullUndefinedColor: chalk.rgb(114, 135, 153),
      dateColor: chalk.rgb(199, 146, 234),
    },
  },
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
export const sunlight: PrettyTerminalTheme = {
  simpleView: {
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
    selectorColor: chalk.rgb(0, 91, 129), // Deep blue for strong contrast
  },
  detailedView: {
    colors: {
      trace: chalk.rgb(110, 110, 110),
      debug: chalk.rgb(32, 96, 159),
      info: chalk.rgb(35, 134, 54),
      warn: chalk.rgb(176, 95, 0),
      error: chalk.rgb(191, 0, 0),
      fatal: chalk.bgRgb(191, 0, 0).white,
    },
    logIdColor: chalk.rgb(110, 110, 110),
    dataValueColor: chalk.rgb(0, 0, 0),
    dataKeyColor: chalk.rgb(32, 96, 159),
    selectorColor: chalk.rgb(0, 91, 129), // Deep blue for strong contrast
    headerColor: chalk.rgb(0, 91, 129),
    labelColor: chalk.rgb(0, 91, 129).bold,
    separatorColor: chalk.rgb(110, 110, 110),
    jsonColors: {
      keysColor: chalk.rgb(32, 96, 159),
      dashColor: chalk.rgb(0, 0, 0),
      numberColor: chalk.rgb(170, 55, 49),
      stringColor: chalk.rgb(35, 134, 54),
      multilineStringColor: chalk.rgb(35, 134, 54),
      positiveNumberColor: chalk.rgb(46, 125, 50),
      negativeNumberColor: chalk.rgb(183, 28, 28),
      booleanColor: chalk.rgb(176, 95, 0),
      nullUndefinedColor: chalk.rgb(110, 110, 110),
      dateColor: chalk.rgb(123, 31, 162),
    },
  },
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
export const neon: PrettyTerminalTheme = {
  simpleView: {
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
    selectorColor: chalk.rgb(0, 255, 240), // Electric cyan for cyberpunk feel
  },
  detailedView: {
    colors: {
      trace: chalk.rgb(108, 108, 255),
      debug: chalk.rgb(255, 82, 246),
      info: chalk.rgb(0, 255, 163),
      warn: chalk.rgb(255, 231, 46),
      error: chalk.rgb(255, 53, 91),
      fatal: chalk.bgRgb(255, 53, 91).rgb(0, 255, 163),
    },
    logIdColor: chalk.rgb(187, 134, 252),
    dataValueColor: chalk.rgb(255, 255, 255),
    dataKeyColor: chalk.rgb(0, 255, 240),
    selectorColor: chalk.rgb(0, 255, 240), // Electric cyan for cyberpunk feel
    headerColor: chalk.rgb(255, 82, 246),
    labelColor: chalk.rgb(255, 82, 246).bold,
    separatorColor: chalk.rgb(108, 108, 255),
    jsonColors: {
      keysColor: chalk.rgb(0, 255, 240),
      dashColor: chalk.rgb(255, 255, 255),
      numberColor: chalk.rgb(255, 82, 246),
      stringColor: chalk.rgb(0, 255, 163),
      multilineStringColor: chalk.rgb(0, 255, 163),
      positiveNumberColor: chalk.rgb(0, 255, 163),
      negativeNumberColor: chalk.rgb(255, 53, 91),
      booleanColor: chalk.rgb(255, 231, 46),
      nullUndefinedColor: chalk.rgb(108, 108, 255),
      dateColor: chalk.rgb(187, 134, 252),
    },
  },
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
export const nature: PrettyTerminalTheme = {
  simpleView: {
    colors: {
      trace: chalk.rgb(121, 85, 72), // Wooden brown
      debug: chalk.rgb(46, 125, 50), // Forest green
      info: chalk.rgb(0, 105, 92), // Deep teal
      warn: chalk.rgb(175, 115, 0), // Golden amber
      error: chalk.rgb(183, 28, 28), // Autumn red
      fatal: chalk.bgRgb(183, 28, 28).rgb(255, 250, 240), // Red bg with soft white
    },
    logIdColor: chalk.rgb(93, 64, 55), // Deep bark brown
    dataValueColor: chalk.rgb(27, 27, 27), // Near black
    dataKeyColor: chalk.rgb(56, 142, 60), // Leaf green
    selectorColor: chalk.rgb(0, 105, 92), // Deep teal for natural feel
  },
  detailedView: {
    colors: {
      trace: chalk.rgb(121, 85, 72),
      debug: chalk.rgb(46, 125, 50),
      info: chalk.rgb(0, 105, 92),
      warn: chalk.rgb(175, 115, 0),
      error: chalk.rgb(183, 28, 28),
      fatal: chalk.bgRgb(183, 28, 28).rgb(255, 250, 240),
    },
    logIdColor: chalk.rgb(93, 64, 55),
    dataValueColor: chalk.rgb(27, 27, 27),
    dataKeyColor: chalk.rgb(56, 142, 60),
    selectorColor: chalk.rgb(0, 105, 92), // Deep teal for natural feel
    headerColor: chalk.rgb(0, 77, 64),
    labelColor: chalk.rgb(0, 77, 64).bold,
    separatorColor: chalk.rgb(121, 85, 72),
    jsonColors: {
      keysColor: chalk.rgb(56, 142, 60),
      dashColor: chalk.rgb(27, 27, 27),
      numberColor: chalk.rgb(230, 81, 0),
      stringColor: chalk.rgb(0, 105, 92),
      multilineStringColor: chalk.rgb(0, 105, 92),
      positiveNumberColor: chalk.rgb(46, 125, 50),
      negativeNumberColor: chalk.rgb(183, 28, 28),
      booleanColor: chalk.rgb(175, 115, 0),
      nullUndefinedColor: chalk.rgb(121, 85, 72),
      dateColor: chalk.rgb(123, 31, 162),
    },
  },
};

/**
 * Pastel - A soft, calming theme with gentle colors
 * Inspired by watercolor paintings and cotton candy skies
 *
 * Color Palette:
 * - Primary: Soft pinks and lavenders
 * - Accents: Mint greens and baby blues
 * - Background: Assumes dark terminal (black or very dark grey)
 *
 * Best used with:
 * - Dark terminal themes
 * - Long coding sessions where eye comfort is priority
 * - Environments where a gentler aesthetic is preferred
 * - Applications focusing on reduced visual stress
 */
export const pastel: PrettyTerminalTheme = {
  simpleView: {
    colors: {
      trace: chalk.rgb(179, 189, 203), // Soft slate blue
      debug: chalk.rgb(189, 178, 255), // Gentle lavender
      info: chalk.rgb(170, 236, 205), // Mint green
      warn: chalk.rgb(255, 223, 186), // Peach
      error: chalk.rgb(255, 188, 188), // Soft coral
      fatal: chalk.bgRgb(255, 188, 188).rgb(76, 40, 40), // Coral bg with deep brown
    },
    logIdColor: chalk.rgb(203, 195, 227), // Dusty lavender
    dataValueColor: chalk.rgb(236, 236, 236), // Soft white
    dataKeyColor: chalk.rgb(186, 207, 255), // Baby blue
    selectorColor: chalk.rgb(189, 178, 255), // Soft lavender for gentle highlighting
  },
  detailedView: {
    colors: {
      trace: chalk.rgb(179, 189, 203),
      debug: chalk.rgb(189, 178, 255),
      info: chalk.rgb(170, 236, 205),
      warn: chalk.rgb(255, 223, 186),
      error: chalk.rgb(255, 188, 188),
      fatal: chalk.bgRgb(255, 188, 188).rgb(76, 40, 40),
    },
    logIdColor: chalk.rgb(203, 195, 227),
    dataValueColor: chalk.rgb(236, 236, 236),
    dataKeyColor: chalk.rgb(186, 207, 255),
    selectorColor: chalk.rgb(189, 178, 255), // Soft lavender for gentle highlighting
    headerColor: chalk.rgb(255, 198, 255), // Cotton candy pink
    labelColor: chalk.rgb(255, 198, 255).bold,
    separatorColor: chalk.rgb(179, 189, 203),
    jsonColors: {
      keysColor: chalk.rgb(186, 207, 255), // Baby blue
      dashColor: chalk.rgb(236, 236, 236), // Soft white
      numberColor: chalk.rgb(255, 198, 255), // Cotton candy pink
      stringColor: chalk.rgb(170, 236, 205), // Mint green
      multilineStringColor: chalk.rgb(170, 236, 205),
      positiveNumberColor: chalk.rgb(170, 236, 205),
      negativeNumberColor: chalk.rgb(255, 188, 188),
      booleanColor: chalk.rgb(255, 223, 186), // Peach
      nullUndefinedColor: chalk.rgb(179, 189, 203),
      dateColor: chalk.rgb(189, 178, 255), // Gentle lavender
    },
  },
};
