import {getChannel} from '../amqp.connection.js'
import {WS_EVENTS_QUEUE} from '../rabbit-queues.js'

class WsEventsProducer {
  /**
   * @param {number} userId
   * @param {string} type
   * @param {any} data
   */
  async sendToUser(userId, type, data) {
    const ch = await getChannel()
    ch.sendToQueue(
      WS_EVENTS_QUEUE,
      Buffer.from(JSON.stringify({userId, type, data})),
      {persistent: true},
    )
  }
}

export const wsEventsProducer = new WsEventsProducer()
