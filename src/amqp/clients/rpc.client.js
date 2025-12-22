import {randomUUID} from 'node:crypto'
import * as Sentry from '@sentry/node'
import {getChannel} from '../amqp.connection.js'

export class RpcClient {
  /**
   * @param {{queue: string, timeoutMs?: number}} options
   */
  constructor({queue, timeoutMs = 5000}) {
    this.queue = queue
    this.timeoutMs = timeoutMs
  }

  /**
   * Low-level RPC call.
   * @param {string} type
   * @param {any} data
   * @param {{timeoutMs?: number}} [options]
   * @returns {Promise<any>}
   */
  async call(type, data, options = {}) {
    const ch = await getChannel()

    const {queue: replyQueue} = await ch.assertQueue('', {exclusive: true})
    const correlationId = randomUUID()

    const timeoutMs = options.timeoutMs ?? this.timeoutMs

    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        Sentry.withScope((scope) => {
          scope.setTag('source', 'amqp')
          scope.setTag('kind', 'rpc-client')
          scope.setTag('queue', this.queue)
          scope.setTag('rpc_type', type)
          scope.setTag('correlation_id', correlationId)
          scope.setContext('rpc_request', {type, data})
          Sentry.captureException(new Error('RPC timeout'))
        })

        reject(new Error('RPC timeout'))
      }, timeoutMs)

      await ch.consume(
        replyQueue,
        (msg) => {
          if (!msg) return
          if (msg.properties.correlationId !== correlationId) return

          clearTimeout(timer)

          try {
            const response = JSON.parse(msg.content.toString())
            resolve(response)
          } catch (e) {
            Sentry.captureException(e)
            reject(e)
          }
        },
        {noAck: true},
      )

      ch.sendToQueue(
        this.queue,
        Buffer.from(JSON.stringify({type, data})),
        {
          correlationId,
          replyTo: replyQueue,
        },
      )
    })
  }
}
