import express from 'express'
import 'dotenv/config'
import apiRoutes from './routes/index.js'
import {errorHandler} from './utils/error-handling/error.handler.js'
import {notFoundHandler} from './utils/error-handling/not-found.handler.js'


const app = express()

app.use(express.json())

// API routes
app.use('/api', apiRoutes)

// Error handling
app.all(/.*/, notFoundHandler)
app.use(errorHandler)

const PORT = process.env.PORT || 3030

app.listen(PORT, () => {
  console.info(`Server is running on port ${PORT} 🚀`)
})
