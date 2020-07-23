import { natsWrapper } from './nats-wrapper'

import { OrderCreatedListener } from './events/listeners/order-created-listener'

const start = async () => {
  console.log('Starting up........')

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined')
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined')
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined')
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    )
    natsWrapper.stan.on('close', () => {
      console.log('NATS was closed')
      process.exit()
    })

    process.on('SIGINT', () => natsWrapper.stan.close())
    process.on('SIGTERM', () => natsWrapper.stan.close())

    new OrderCreatedListener(natsWrapper.stan).listen()
  } catch (error) {
    console.log(error)
  }
}

start()
