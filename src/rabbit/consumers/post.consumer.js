import {Consumer} from './consumer.js'
import {POST_QUEUE} from '../rabbit-queues.js'
import {notificationService} from '../../services/notification.service.js'
import {wsEventsProducer} from '../producers/ws-events.producer.js'

export class PostConsumer extends Consumer {
  /**
   * @param {{channel: import('amqplib').Channel}} deps
   */
  constructor({channel}) {
    super({
      queue: POST_QUEUE,
      channel,
      prefetch: 10,
      requeueOnError: false, // change to true if you want retry
    })
  }

  /**
   * @param {{type:string, data:any}} payload
   * @param {import('amqplib').Message} msg
   * @returns {Promise<void>}
   */
  async handle(payload, msg) { // msg available if you later need headers, deliveryTag, etc.
    const {type, data} = payload || {}

    switch (type) {
      case 'post.created': {
        const {postId, userId} = data

        const note = await notificationService.createNotification(
          userId,
          {
            type,
            refId: postId,
            message: `Your post #${postId} has been created successfully!`,
          },
        )

        // send notification via ws
        await wsEventsProducer.sendToUser(userId, 'post.created', note)

        console.log(`📩 notification created for user:${userId}, post:${postId}`)
        break
      }

      case 'post.deleted': {
        const {postId, userId} = data

        const note = await notificationService.createNotification(userId, {
          type,
          refId: postId,
          message: `Your post #${postId} has been deleted.`,
        })

        // send notification via ws
        await wsEventsProducer.sendToUser(userId, 'post.deleted', note)

        console.log(`🥡 notification deleted for user:${userId}, post:${postId}`)
        break
      }

      default: {
        console.warn('Unknown post consumer message:', payload)
        break
      }
    }
  }
}
