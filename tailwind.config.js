const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        "purple": {
          colors: {
            primary: {
              50: "#F2EAFA",
              100: "#E4D4F4",
              200: "#C9A9E9",
              300: "#AE7EDE",
              400: "#9353D3",
              500: "#7828C8",
              600: "#6020A0",
              700: "#481878",
              800: "#301050",
              900: "#180828",
              DEFAULT: "#6020A0",
            },
          },
        },
      },
    }),
  ],

}