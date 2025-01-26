import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/', // Base URL for your app (adjust for GitHub Pages if needed)

    root: './src', // Root directory for the project

    publicDir: '../public', // Directory for static files

    build: {
        outDir: '../dist', // Output directory for production build
        emptyOutDir: true, // Clean the output directory before building
        assetsDir: 'assets', // Directory for built assets inside the output folder
    },

    plugins: [
        VitePWA({
            registerType: 'autoUpdate', // Automatically update the service worker
            manifest: {
                name: 'My Vite PWA',
                short_name: 'VitePWA',
                description: 'A Progressive Web App built with Vite',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                runtimeCaching: [
                    // Cache image files (including textures)
                    {
                        urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)/, // Match texture file extensions
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 days
                            },
                        },
                    },
                    // Cache .glb files (low-poly models)
                    {
                        urlPattern: /.*\.(?:glb|gltf)/, // Match .glb and .gltf file extensions
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'model-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 days
                            },
                        },
                    },
                    // Cache other static assets like JS, CSS, HTML
                    {
                        urlPattern: /.*\.(?:js|css|html|json|woff|woff2|ttf|otf)/, // Static assets
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 days
                            },
                        },
                    },
                ],
            },
        }),
    ],

    server: {
        open: true, // Automatically open the app in the browser
        port: 3000, // Local development server port
    },
});
