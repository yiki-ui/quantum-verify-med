import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            // Include polyfills needed by Web3Auth
            include: ['buffer', 'process', 'stream', 'util', 'crypto'],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        }),
    ],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    resolve: {
        alias: {
            // Fix build error from shared library
            'vite-plugin-node-polyfills/shims/buffer': 'buffer',
            // Force bundling by using absolute paths or explicit package resolution
            buffer: 'buffer',
            process: 'process/browser',
            stream: 'stream-browserify',
            util: 'util',
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
        include: ['buffer', 'process', 'util', 'stream-browserify'],
    },
})
