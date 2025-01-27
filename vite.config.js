import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/', // Adjust for deployment location

    publicDir: 'public', // Default public directory

    build: {
        outDir: 'dist', // Default output directory
        emptyOutDir: true,
        assetsDir: 'assets',
    },

    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'My Vite PWA',
                short_name: 'VitePWA',
                description: 'A Progressive Web App built with Vite',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: './', // Adjusted for relative paths
                icons: [
                    {
                        src: './icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: './icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 30 * 24 * 60 * 60,
                            },
                        },
                    },
                    {
                        urlPattern: /.*\.(?:glb|gltf)/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'model-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 30 * 24 * 60 * 60,
                            },
                        },
                    },
                    {
                        urlPattern: /.*\.(?:js|css|html|json)/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 30 * 24 * 60 * 60,
                            },
                        },
                    },
                ],
            },
        }),
    ],

    server: {
        open: true,
        port: 5558,
    },
});
