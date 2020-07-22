import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

import { createPaymentRouter } from './routes/new'

import { currentUser, errorHandler, NotFoundError } from '@bevticketing/common'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
)
app.use(currentUser)

app.use(createPaymentRouter)

app.all('*', async () => {
  throw new NotFoundError()
})
app.use(errorHandler)

export { app }
