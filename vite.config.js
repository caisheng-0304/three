import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

import cesium from 'vite-plugin-cesium'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),cesium()],
  resolve: {
    alias: {
      // 设置路径 这里resolve和join可自行选用
      "~": path.resolve(__dirname, "./"),
      // 设置别名
      "@": path.resolve(__dirname, "./src"),
    },

    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
  baseURL:'./web/yunqizhineng/ceshi',
  server: {
    // Listening on all local IPs
    host: true,
    port: '3000',
    // Load proxy configuration from .env
  },
});
