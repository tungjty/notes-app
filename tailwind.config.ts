// ChatGPT fix this #error#

// (node:6785) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/hoangtung/Desktop/notes-app/tailwind.config.js?id=1758725801778 is not specified and it doesn't parse as CommonJS.
// Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
// To eliminate this warning, add "type": "module" to /Users/hoangtung/Desktop/notes-app/package.json.

import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;


// import {heroui} from "@heroui/theme"

// /** @type {import('tailwindcss').Config} */
// const config = {
//   content: [
//     './components/**/*.{js,ts,jsx,tsx,mdx}',
//     './app/**/*.{js,ts,jsx,tsx,mdx}',
//     "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ["var(--font-sans)"],
//         mono: ["var(--font-mono)"],
//       },
//     },
//   },
//   darkMode: "class",
//   plugins: [heroui()],
// }

// module.exports = config;