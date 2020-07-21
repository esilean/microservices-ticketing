import request from 'supertest'
import { app } from '../../app'
import generateMongoId from '../../test/generate-mongo-id'
import { Order } from '../../models/order'
import { OrderStatus } from '@bevticketing/common'

// I'm using real test instead mock
// import { stripe } from '../../gateways/stripe'
// jest.mock('../../gateways/stripe')

it('return an 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: '123456',
      orderId: generateMongoId(),
    })
    .expect(404)
})

it('return an 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: generateMongoId(),
    version: 0,
    status: OrderStatus.Created,
    userId: generateMongoId(),
    price: 10,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: '123456',
      orderId: order.id,
    })
    .expect(401)
})

it('return an 400 when purchasing an cancelled order ', async () => {
  const userId = generateMongoId()

  const order = Order.build({
    id: generateMongoId(),
    version: 0,
    status: OrderStatus.Cancelled,
    userId: userId,
    price: 10,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: '123456',
      orderId: order.id,
    })
    .expect(400)
})

// it('returns a 201 with valid inputs', async () => {
//   const userId = generateMongoId()

//   const order = Order.build({
//     id: generateMongoId(),
//     version: 0,
//     status: OrderStatus.Created,
//     userId: userId,
//     price: 10,
//   })
//   await order.save()

//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.signin(userId))
//     .send({
//       token: 'tok_visa',
//       orderId: order.id,
//     })
//     .expect(201)

//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
//   expect(chargeOptions.source).toEqual('tok_visa')
//   expect(chargeOptions.amount).toEqual(order.price * 100)
//   expect(chargeOptions.currency).toEqual('usd')
// })
