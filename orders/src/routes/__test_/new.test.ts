import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order'
import { Ticket } from '../../models/ticket'
import generateMongoId from '../../test/generate-mongo-id'
import { OrderStatus } from '@bevticketing/common'
import { natsWrapper } from '../../nats-wrapper'

it('returns an error 404 if the ticket does not exist', async () => {
  const ticketId = generateMongoId()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404)
})

it('returns an error 400 if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: 'title',
    price: 10,
  })
  await ticket.save()

  const order = Order.build({
    ticket,
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  })
  await order.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400)
})

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: 'title',
    price: 10,
  })
  await ticket.save()

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201)

  expect(response.body.ticket.id).toEqual(ticket.id)
})

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: 'title',
    price: 10,
  })
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201)

  expect(natsWrapper.stan.publish).toHaveBeenCalled()
})
