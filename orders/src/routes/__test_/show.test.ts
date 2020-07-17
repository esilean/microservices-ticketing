import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'

const createTicket = async () => {
  const ticket = Ticket.build({
    title: 'title',
    price: 10,
  })
  await ticket.save()
  return ticket
}

it('return an error 401 if one user tries to fecth another users order', async () => {
  const ticket = await createTicket()
  const user = global.signin()
  const anotherUser = global.signin()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app).get(`/api/orders/${order.id}`).set('Cookie', anotherUser).send().expect(401)
})

it('fetches orders for an particular user', async () => {
  const ticket = await createTicket()
  const user = global.signin()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200)

  expect(response.body.id).toEqual(order.id)
  expect(response.body.ticket.id).toEqual(ticket.id)
})
