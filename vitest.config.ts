import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const useBrowser = process.env.A11Y_BROWSER === "1";
const browserName = process.env.A11Y_BROWSER_NAME || "chromium";

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify("test"),
    __BUILD_TIMESTAMP__: JSON.stringify("0"),
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    ...(useBrowser
      ? {
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            instances: [{ browser: browserName as "chromium" | "firefox" | "webkit" }],
          },
        }
      : { environment: "jsdom" }),
  },
});