
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.png',
        'apple-touch-icon.png',
        'icone-192.png',
        'icone-512.png',
      ],
      manifest: {
        name: 'Consulta Fácil',
        short_name: 'Consulta Fácil',
        description:
          'Encontre e agende seu atendimento de forma simples e segura.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icone-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icone-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2}',
        ],
      },
    }),
  ],
})
