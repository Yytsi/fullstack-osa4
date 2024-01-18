const http = require('http')
const config = require('./utils/config.js')
const express = require('express')
require('express-async-errors')

const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs.js')
const usersRouter = require('./controllers/users.js')
const loginRouter = require('./controllers/login.js')
const middleware = require('./utils/middleware.js')
const logger = require('./utils/logger.js')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  }).catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app