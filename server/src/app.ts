import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import { generalRateLimiter } from './middleware/rateLimiter.js'
import { effectRoutes } from './routes/effects.js'

const app = express()

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }))
app.use(express.json())
app.use(generalRateLimiter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use('/api/effects', effectRoutes)

// Error handler (must be last)
app.use(errorHandler)

// Start server
const PORT = parseInt(config.PORT, 10)
app.listen(PORT, () => {
  console.log(`🚀 PromptFX server running on http://localhost:${PORT}`)
  console.log(`   Environment: ${config.NODE_ENV}`)
})

export default app
