import { defineConfig } from "vitest/config";

// Config aparte de vite.config.js: los tests son de lib.js, no necesitan el
// plugin de React y sin él la salida queda limpia.
export default defineConfig({
  test: {
    include: ["src/**/*.test.js"],
    environment: "node",
  },
});
