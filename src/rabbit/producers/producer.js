import * as Sentry from '@sentry/node'
import {getChannel} from '../amqp.connection.js'
import {requestContext} from '../../utils/request-context.js'
import {applyAmqpScope} from '../helpers/sentry-amqp.js'

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

    const requestId = requestContext.getRequestId()
    const userId = requestContext.getUserId()

    try {
      ch.sendToQueue(
        this.queue,
        Buffer.from(JSON.stringify(payload)),
        {
          persistent: true,
          headers: {
            request_id: requestId,
            user_id: userId ? String(userId) : undefined,
          },
        },
      )
    } catch (err) {
      console.error(err)

      Sentry.withScope((scope) => {
        applyAmqpScope(scope, {
          kind: 'producer',
          queue: this.queue,
          payload,
          msg: null,
        })
        if (requestId) scope.setTag('request_id', String(requestId))
        if (userId) scope.setUser({id: String(userId)})
        Sentry.captureException(err)
      })

      throw err
    }
  }
}
