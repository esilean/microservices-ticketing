import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Ticket } from '../../model/tickets'

import generateMongoId from '../../test/generate-mongo-id'

it('returns a 404 if the tickets is not found', async () => {
  const id = generateMongoId()
  await request(app).get(`/api/tickets/${id}`).send().expect(404)
})

it('returns the ticket if the ticket is found', async () => {
  const title = 'title'
  const price = 10

  const ticket = Ticket.build({
    title,
    price,
    userId: 'some-user-id',
  })
  await ticket.save()

  const response = await request(app).get(`/api/tickets/${ticket.id}`).send().expect(200)

  expect(response.body.title).toEqual(title)
  expect(response.body.price).toEqual(price)
})
