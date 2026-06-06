import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#E4E7EC",
        ink: "#111827",
        muted: "#667085",
        primary: "#176B5B",
        "primary-dark": "#0F4F43",
        danger: "#B42318",
        surface: "#FFFFFF",
        wash: "#F8FAFC",
        travel: {
          primary: "#B92216",
          secondary: "#0071EB",
          rating: "#FFB800",
          dark: "#1A1A1A",
          muted: "#6A6A6A",
          border: "#EAEAEA",
          bg: "#F5F7FA"
        }
      },
      borderRadius: {
        "travel-md": "var(--radius-travel-md)",
        "travel-lg": "var(--radius-travel-lg)"
      },
      fontFamily: {
        brand: ["var(--font-brand)", "ui-sans-serif", "system-ui", "sans-serif"],
        interface: ["var(--font-interface)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 24px rgba(16, 24, 40, 0.06)",
        travel: "0 18px 48px rgba(26, 26, 26, 0.09)",
        "travel-card": "0 14px 34px rgba(26, 26, 26, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
