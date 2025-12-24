import 'dotenv/config'
import './utils/sentry/sentry-instrument.js'
import express from 'express'
import apiRoutes from './routes/index.js'
import {errorHandler} from './utils/error-handling/error.handler.js'
import {notFoundHandler} from './utils/error-handling/not-found.handler.js'
import * as Sentry from '@sentry/node'
import {requestMiddleware} from './middlewares/request.middleware.js'
import {WsApp} from './ws/ws-app.js'


const app = express()

app.use(express.json())

// creating request namespace and setting request ID
app.use(requestMiddleware)

// API routes
app.use('/api', apiRoutes)

// 404 not-found handler
app.all(/.*/, notFoundHandler)

// Sentry handler
app.use(Sentry.expressErrorHandler({
  shouldHandleError() {
    return true
  },
}))

// Error handling
app.use(errorHandler)

const wsApp = new WsApp({port: process.env.WS_PORT || 4040})
wsApp.init().catch((err) => {
  console.error('WS init failed', err)
  process.exit(1)
})

const PORT = process.env.PORT || 3030

app.listen(PORT, () => {
  console.info(`Server is running on port ${PORT} 🚀`)
})
