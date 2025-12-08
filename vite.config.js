import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from "path"
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'window', 
  },
})
