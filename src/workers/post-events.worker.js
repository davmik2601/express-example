import 'dotenv/config'
import '../utils/sentry/sentry-instrument.js'
import {getChannel} from '../rabbit/amqp.connection.js'
import {PostConsumer} from '../rabbit/consumers/post.consumer.js'

async function start() {
  const ch = await getChannel()
  const consumer = new PostConsumer({channel: ch})
  await consumer.start()
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
