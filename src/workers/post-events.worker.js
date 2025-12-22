import {getChannel} from '../amqp/amqp.connection.js'
import {PostConsumer} from '../amqp/consumers/post.consumer.js'

async function start() {
  const ch = await getChannel()
  const consumer = new PostConsumer({channel: ch})
  await consumer.start()
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
