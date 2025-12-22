import 'dotenv/config'
import '../utils/sentry/sentry-instrument.js'
import {getChannel} from '../amqp/amqp.connection.js'
import {PostRpcConsumer} from '../amqp/consumers/post-rpc.consumer.js'

async function start() {
  const ch = await getChannel()
  const consumer = new PostRpcConsumer({channel: ch})
  await consumer.start()
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
