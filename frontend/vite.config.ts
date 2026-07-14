import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Desa Wisata Kampung Nelayan Bahari Tambaklorok",
        short_name: "Tanjung Mas",
        description:
          "Wisata bahari, UMKM, dan kabar desa Kelurahan Tanjung Mas, Semarang.",
        lang: "id",
        start_url: "/",
        display: "standalone",
        background_color: "#f8f9ff",
        theme_color: "#000242",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            // Android memotong ikon (bisa jadi lingkaran); versi ini sudah
            // diberi ruang aman agar crest tidak terpotong.
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
