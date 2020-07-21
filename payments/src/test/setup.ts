import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import generateMongoId from './generate-mongo-id'
import { app } from '../app'

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[]
    }
  }
}

jest.mock('../nats-wrapper')

process.env.STRIPE_KEY =
  'sk_test_51H7OS2KuY6GjxtniiTNdak9EJSnjZB1wdcAeptI3hbaljCygXvhM1P47NIJrlhR5UQeA8zvpWSoFjsoMoAQkIDrJ00uvkQFNYI'

let mongo: any
beforeAll(async () => {
  process.env.JWT_KEY = 'asdf'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

beforeEach(async () => {
  jest.clearAllMocks()

  const collections = await mongoose.connection.db.collections()
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

global.signin = (id?: string) => {
  // build a JWT payload. {id, email}
  const payload = {
    id: id || generateMongoId(),
    email: 'test@test.com',
  }

  // create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // build a session object { jwt: MY_JWT}
  const session = { jwt: token }

  // turn that session into JSON
  const sessionJSON = JSON.stringify(session)

  // take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  //return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`]
}
