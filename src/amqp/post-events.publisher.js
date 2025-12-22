import {getChannel} from './amqp.connection.js'

const POST_EVENTS_QUEUE = 'post-events'

export class PostEventsPublisher {
  /**
   * @param {{queue?: string}} [options]
   */
  constructor(options = {}) {
    this.queue = options.queue || POST_EVENTS_QUEUE
  }

  /**
   * Ensure queue exists (called automatically).
   * @returns {Promise<import('amqplib').Channel>}
   */
  async getReadyChannel() {
    const ch = await getChannel()
    await ch.assertQueue(this.queue, {durable: true})
    return ch
  }

  /**
   * Low-level send for any post event.
   * @param {string} type
   * @param {any} data
   * @returns {Promise<void>}
   */
  async publish(type, data) {
    const ch = await this.getReadyChannel()

    ch.sendToQueue(
      this.queue,
      Buffer.from(JSON.stringify({type, data}), 'utf-8'),
      {persistent: true},
    )
  }

  /**
   * Event: post created
   * @param {{postId:number, userId:number}} data
   * @returns {Promise<void>}
   */
  async postCreated(data) {
    return this.publish('post.created', data)
  }

  /**
   * Event: post deleted
   * @param {{postId:number, userId:number}} data
   * @returns {Promise<void>}
   */
  async postDeleted(data) {
    return this.publish('post.deleted', data)
  }
}

// one shared instance (simple)
export const postEventsPublisher = new PostEventsPublisher()
