import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

/**
 * Tailwind v4 applies typography via `app/globals.css` (`@plugin "@tailwindcss/typography"`).
 * This config documents the plugin for tooling; PostCSS uses the CSS entry by default.
 */
const config = {
  plugins: [typography],
} satisfies Config;

export default config;
