import {getChannel} from '../rabbit/amqp.connection.js'
import {WsEventsConsumer} from '../rabbit/consumers/ws-events.consumer.js'

export async function startWsDeliveryConsumer() {
  const ch = await getChannel()
  const consumer = new WsEventsConsumer({channel: ch})
  await consumer.start()

  console.log('🟢 WS delivery consumer started')
}
