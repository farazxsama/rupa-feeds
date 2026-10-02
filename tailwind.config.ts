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
          950: "#08201C",
          900: "#0F2A26",
          800: "#163A33",
          700: "#1F4D42",
          500: "#3E7F6E",
          300: "#93BFAF",
          100: "#DCEBE4",
        },
        grain: { 700: "#8E6220", 500: "#C8913A", 300: "#E3BE7A" },
        mist: "#F4F1EA",
        sand: "#E8E1D2",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      letterSpacing: { brand: "0.32em" },
    },
  },
  plugins: [],
};
export default config;
