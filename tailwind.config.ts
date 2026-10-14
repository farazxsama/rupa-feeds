import type { Config } from "tailwindcss";

/**
 * Rupa Feeds UI palette: primary #0504AA (pond-700) with lighter / darker
 * shades, plus white. Every page reads from here. The homepage 3D pond does
 * NOT use these tokens — its water, light and fog colours live in
 * src/components/3d and are independent of the site theme.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1A17",
        pond: {
          950: "#020250",
          900: "#030378",
          800: "#04048F",
          700: "#0504AA",
          500: "#2F2EE0",
          300: "#A8A7F7",
          100: "#E9E9FE",
        },
        mist: "#F4F1EA",
        sand: "#E8E1D2",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      letterSpacing: { brand: "0.32em" },
    },
  },
  plugins: [],
};
export default config;
