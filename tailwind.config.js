/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#eab308",
        secondary: "#1e293b",
        third:"#475569",
        bgpage:"#111827",
        btnprimary:"#3b82f6",
        btnsecondary:"#16a34a",
      },
    },
  },
  plugins: [],
};
