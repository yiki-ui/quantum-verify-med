import { defineConfig, type ViteDevServer, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import type { ServerResponse } from 'http'

// Load environment variables for local API execution
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

// Custom plugin to serve Vercel /api routes locally
const vercelApiPlugin = () => ({
    name: 'vercel-api-plugin',
    configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
            if (req.url?.startsWith('/api/')) {
                try {
                    const endpoint = req.url.split('?')[0];
                    const filePath = path.resolve(__dirname, `.${endpoint}.ts`);
                    
                    if (fs.existsSync(filePath)) {
                        const module = await server.ssrLoadModule(filePath);
                        
                        let body = '';
                        req.on('data', chunk => {
                            body += chunk.toString();
                        });
                        
                        req.on('end', async () => {
                            if (body) {
                                try {
                                    (req as any).body = JSON.parse(body);
                                } catch (e) {}
                            }
                            
                            if (module.default) {
                                // Mock Vercel response
                                (res as any).status = (code: number) => {
                                    res.statusCode = code;
                                    return res;
                                };
                                (res as any).json = (data: any) => {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify(data));
                                };
                                
                                await module.default(req, res);
                            } else {
                                res.statusCode = 404;
                                res.end('Not found');
                            }
                        });
                        return;
                    }
                } catch (e) {
                    console.error("API Plugin Error:", e);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                    return;
                }
            }
            next();
        });
    }
});

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        vercelApiPlugin(),
    ],
    server: {
        port: 3000,
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
