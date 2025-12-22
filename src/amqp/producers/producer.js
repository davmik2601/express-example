import {getChannel} from '../amqp.connection.js'

/**
 * Base producer (fire-and-forget).
 */
export class Producer {
  /**
   * @param {{queue: string}} options
   */
  constructor({queue}) {
    this.queue = queue
  }

  /**
   * Ensure queue exists and return a channel.
   * @returns {Promise<import('amqplib').Channel>}
   */
  async getReadyChannel() {
    const ch = await getChannel()
    await ch.assertQueue(this.queue, {durable: true})
    return ch
  }

  /**
   * Low-level send to queue.
   * @param {any} payload
   * @returns {Promise<void>}
   */
  async send(payload) {
    const ch = await this.getReadyChannel()

    ch.sendToQueue(
      this.queue,
      Buffer.from(JSON.stringify(payload)),
      {persistent: true},
    )
  }
}
