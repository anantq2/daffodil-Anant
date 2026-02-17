import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import analyzeHandler from './api/analyze.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const devApiPlugin = {
  name: 'dev-api-analyze',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const cleanUrl = (req.url || '').split('?')[0]
      if (cleanUrl !== '/api/analyze') {
        next()
        return
      }

      try {
        await analyzeHandler(req, res)
      } catch (error) {
        console.error('Dev /api/analyze error:', error)
        if (!res.headersSent) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal server error.' }))
        }
      }
    })
  },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Make server-side env available for local dev API handler.
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY
  process.env.GEMINI_MODEL = process.env.GEMINI_MODEL || env.GEMINI_MODEL
  process.env.RATE_LIMIT_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS || env.RATE_LIMIT_MAX_REQUESTS
  process.env.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS || env.RATE_LIMIT_WINDOW_MS

  return {
    plugins: [react(), tailwindcss(), devApiPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
