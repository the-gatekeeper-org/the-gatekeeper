import defaultTheme from "tailwindcss/defaultTheme";
import { bg, text, border } from "./src/ui/colors.ts";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      width: {
        toolbar: `calc(100% - 2 * ${defaultTheme.spacing["5"]})`,
        "primary-button": defaultTheme.spacing["8"],
      },
      height: ({ theme }) => ({
        "primary-button": theme("width.primary-button"),
      }),
      minWidth: {
        main: "1024px",
      },
      minHeight: {
        main: "576px",
      },
      inset: {
        main: defaultTheme.spacing["5"],
      },
      // any color key that begins with a "0" is for light mode, and "1" is for dark mode
      backgroundColor: {
        ...bg,
      },
      textColor: {
        ...text,
      },
      borderColor: {
        ...border,
      },
    },
  },
  plugins: [],
};
