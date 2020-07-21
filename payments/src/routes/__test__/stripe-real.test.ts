import request from 'supertest'
import { app } from '../../app'
import generateMongoId from '../../test/generate-mongo-id'
import { Order } from '../../models/order'
import { OrderStatus } from '@bevticketing/common'
import { stripe } from '../../gateways/stripe'
import { Payment } from '../../models/payment'

it('returns a 201 with valid inputs', async () => {
  const userId = generateMongoId()
  const price = Math.floor(Math.random() * 100000)

  const order = Order.build({
    id: generateMongoId(),
    version: 0,
    status: OrderStatus.Created,
    userId,
    price,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)

  const charges = stripe.charges.list({ limit: 30 })
  const charge = (await charges).data.find((charge) => {
    return charge.amount === price * 100
  })

  expect(charge).toBeDefined()

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: charge!.id,
  })

  expect(payment).not.toBeNull()
})
