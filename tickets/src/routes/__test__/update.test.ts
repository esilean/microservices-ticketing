import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../model/tickets'
import generateMongoId from '../../test/generate-mongo-id'

it('returns a 404 if the supplied id does not exist', async () => {
  await request(app)
    .put(`/api/tickets/${generateMongoId()}`)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10,
    })
    .expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
  await request(app)
    .put(`/api/tickets/${generateMongoId()}`)
    .send({
      title: 'title',
      price: 10,
    })
    .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
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
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 20,
    })
    .expect(401)
})

it('returns a 400 if the user provides an invalid title or price', async () => {
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
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: -10,
    })
    .expect(400)
})

it('updates the ticket provided with valid inputs', async () => {
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
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'newtitle',
      price: 200,
    })
    .expect(200)

  const ticket = await Ticket.findById(response.body.id)

  expect(ticket!.title).toEqual('newtitle')
  expect(ticket!.price).toEqual(200)
})
