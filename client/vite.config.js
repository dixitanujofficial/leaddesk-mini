import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Enables Vite's automatic JSX runtime so components do not rely on a global React variable.
export default defineConfig({
  plugins: [react()],
});
