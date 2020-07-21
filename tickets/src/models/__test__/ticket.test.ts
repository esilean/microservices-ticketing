import { Ticket } from '../tickets'

it('implements optimistic concurrency control', async (done) => {
  // create an instance of a ticket
  const ticket = Ticket.build({ title: 'title', price: 10, userId: '132' })

  // save the ticket
  await ticket.save()

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id)

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 50 })
  secondInstance!.set({ price: 15 })

  // save the first fetched ticket
  await firstInstance!.save()

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save()
  } catch (error) {
    return done()
  }

  throw new Error('Should not get here')
})

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({ title: 'title', price: 10, userId: '123' })

  await ticket.save()
  expect(ticket.version).toEqual(0)

  await ticket.save()
  expect(ticket.version).toEqual(1)

  await ticket.save()
  expect(ticket.version).toEqual(2)
})
