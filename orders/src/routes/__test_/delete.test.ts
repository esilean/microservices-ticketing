import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { Order } from '../../models/order'
import { OrderStatus } from '@bevticketing/common'
import generateMongoId from '../../test/generate-mongo-id'
import { natsWrapper } from '../../nats-wrapper'

it('returns an error 401 if the order is owned by another user', async () => {
  //create a ticket
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: 'title',
    price: 10,
  })
  await ticket.save()

  const user = global.signin()
  const anotherUser = global.signin()

  // maker a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201)

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', anotherUser)
    .send({
      ticketId: ticket.id,
    })
    .expect(401)
})

it('marks an order as cancelled', async () => {
  //create a ticket
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: 'title',
    price: 10,
  })
  await ticket.save()

  const user = global.signin()

  // maker a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201)

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(200)

  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
  //create a ticket
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: 'title',
    price: 10,
  })
  await ticket.save()

  const user = global.signin()

  // maker a request to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201)

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(200)

  expect(natsWrapper.stan.publish).toHaveBeenCalled()
})
