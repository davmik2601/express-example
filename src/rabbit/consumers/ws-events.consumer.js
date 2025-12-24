import {Consumer} from './consumer.js'
import {WS_EVENTS_QUEUE} from '../rabbit-queues.js'
import {wsClient} from '../../ws/ws-client.js'

export class WsEventsConsumer extends Consumer {
  constructor({channel}) {
    super({
      queue: WS_EVENTS_QUEUE,
      channel,
      prefetch: 100,
      requeueOnError: true,
    })
  }

  /**
   * @param {{userId:number, type:string, data:any}} payload
   * @param {import('amqplib').Message} _msg
   * @returns {Promise<void>}
   */
  async handle(payload, _msg) {
    const userId = Number(payload?.userId)
    if (!userId) return

    wsClient.sendToUser(
      userId,
      JSON.stringify({type: payload.type, data: payload.data}),
    )
  }
}
