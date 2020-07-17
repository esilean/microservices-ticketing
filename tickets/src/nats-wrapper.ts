import nats, { Stan } from 'node-nats-streaming'

class NatsWrapper {
  private client?: Stan

  get stan() {
    if (!this.client) {
      throw new Error('Cannot access NATS client before connecting')
    }

    return this.client
  }

  connect(clusterId: string, clientId: string, url: string) {
    this.client = nats.connect(clusterId, clientId, { url })

    return new Promise((resolve, reject) => {
      this.stan.on('connect', () => {
        console.log('Connected to NATS')
        resolve()
      })
      this.stan.on('error', (err) => {
        reject(err)
      })
    })
  }
}

export const natsWrapper = new NatsWrapper()
