import type { Config } from "tailwindcss";

/**
 * Provisional Rupa Feeds palette. Swap these for the official brand values
 * once the client supplies their guidelines — every component reads from here.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1A17",
        pond: {
          950: "#082F49",
          900: "#0C4A6E",
          800: "#155E75",
          700: "#0E7490",
          500: "#0891B2",
          300: "#7DD3FC",
          100: "#E0F2FE",
        },
        grain: { 700: "#8E6220", 500: "#C8913A", 300: "#E3BE7A" },
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
