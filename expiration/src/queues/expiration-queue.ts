import Queue from 'bull'
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-pusblisher'
import { natsWrapper } from '../nats-wrapper'

interface Payload {
  orderId: string
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
})

expirationQueue.process(async (job: Queue.Job<Payload>) => {
  new ExpirationCompletePublisher(natsWrapper.stan).publish({
    orderId: job.data.orderId,
  })
})

export { expirationQueue }
