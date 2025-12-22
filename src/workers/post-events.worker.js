import {getChannel} from '../amqp/amqp.connection.js'
import {notificationService} from '../services/notification.service.js'

const QUEUE = 'post-events'

async function start() {
  const ch = await getChannel()
  await ch.assertQueue(QUEUE, {durable: true})

  // take only 10 unacked messages at a time (safe)
  ch.prefetch(10)

  console.log(`✅ Worker is listening: ${QUEUE}`)

  await ch.consume(QUEUE, async (msg) => {
    if (!msg) return

    try {
      const payload = JSON.parse(msg.content.toString('utf-8'))
      const {type, data} = payload || {}

      switch (type) {
        case 'post.created': {
          const {postId, userId} = data

          await notificationService.createNotification(
            userId,
            {
              type,
              refId: postId,
              message: `Your post #${postId} has been created successfully!`,
            },
          )

          console.log(`📩 notification created for user:${userId}, post:${postId}`)
          break
        }

        case 'post.deleted': {
          const {postId, userId} = data

          await notificationService.createNotification(userId, {
            type,
            refId: postId,
            message: `Your post #${postId} has been deleted.`,
          })

          console.log(`🥡 notification deleted for user:${userId}, post:${postId}`)
          break
        }

        default: {
          console.warn('Unknown post-events message:', payload)
          break
        }
      }

      // ✅ success -> remove message from queue
      ch.ack(msg, false)
    } catch (e) {
      console.error('❌ worker error:', e)

      // if you want retry later:
      // ch.nack(msg, false, true)

      // if you don't want retry (drop it):
      ch.nack(msg, false, false)
    }
  }, {noAck: false})
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
