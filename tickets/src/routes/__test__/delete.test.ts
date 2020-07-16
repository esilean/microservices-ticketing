import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../model/tickets'
import generateMongoId from '../../test/generate-mongo-id'

it('return a 404 if the provided id does not exist', async () => {
  await request(app)
    .delete(`/api/tickets/${generateMongoId()}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(404)
})

it('return a 401 if the user is not authenticated', async () => {
  await request(app).delete(`/api/tickets/${generateMongoId()}`).send({}).expect(401)
})

it('return a 401 if the user does not own the ticket', async () => {
  //create a ticket
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10,
    })
    .expect(201)

  await request(app)
    .delete(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(401)
})

it('deletes the ticket provided', async () => {
  const cookie = global.signin()

  //create a ticket
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 10,
    })
    .expect(201)

  await request(app)
    .delete(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204)

  const ticket = await Ticket.findById(response.body.id)

  expect(ticket).toBeNull()
})
