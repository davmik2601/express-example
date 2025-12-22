import * as Sentry from '@sentry/node'

/**
 * Base class for RabbitMQ RPC consumers.
 * - parses JSON
 * - sets Sentry context
 * - calls child handler
 * - always replies (success or error)
 * - ACKs message (so client won't time out / duplicate)
 */
export class RpcConsumer {
  /**
   * @param {{
   *   queue: string,
   *   channel: import('amqplib').Channel,
   *   prefetch?: number,
   * }} options
   */
  constructor({queue, channel, prefetch = 5}) {
    this.queue = queue
    this.channel = channel
    this.prefetch = prefetch
  }

  /**
   * Start consuming RPC requests.
   * @returns {Promise<void>}
   */
  async start() {
    await this.channel.assertQueue(this.queue, {durable: true})
    this.channel.prefetch(this.prefetch)

    console.log(`🧠 RPC Worker listening: ${this.queue}`)

    await this.channel.consume(this.queue, this._onRawMessage.bind(this), {noAck: false})
  }

  /**
   * Child class must implement this.
   * Must return an object which will be JSON-serialized as RPC response.
   * @param {any} payload
   * @param {import('amqplib').Message} msg
   * @returns {Promise<any>}
   */
  async handle(_payload, _msg) {
    throw new Error('handle() not implemented')
  }

  /**
   * Default error response (safe for clients).
   * Child can override if needed.
   * @param {Error} _err
   * @param {any} _payload
   * @returns {any}
   */
  buildErrorResponse(_err, _payload) {
    return {allowed: false, reason: 'rpc internal error'}
  }

  /**
   * Internal: raw message handler with global try/catch.
   * @param {import('amqplib').Message | null} msg
   * @returns {Promise<void>}
   */
  async _onRawMessage(msg) {
    if (!msg) return

    let payload = null

    try {
      payload = JSON.parse(msg.content.toString())

      const response = await Sentry.withScope(async (scope) => {
        scope.setTag('source', 'amqp')
        scope.setTag('kind', 'rpc')
        scope.setTag('queue', this.queue)

        if (payload?.type) scope.setTag('rpc_type', payload.type)
        if (msg.properties?.correlationId) scope.setTag('correlation_id', msg.properties.correlationId)

        if (payload?.data?.userId) {
          scope.setUser({id: String(payload.data.userId)})
        }

        scope.setContext('amqp_payload', payload)

        // must return response
        return await this.handle(payload, msg)
      })

      this._reply(msg, response)
      this.channel.ack(msg, false)
    } catch (err) {
      console.error(err)
      Sentry.captureException(err)

      // Always reply so client won't time out
      const errorResponse = this.buildErrorResponse(err, payload)
      this._reply(msg, errorResponse)

      // ACK to avoid stuck/infinite requeue for RPC
      this.channel.ack(msg, false)
    }
  }

  /**
   * Internal: send RPC response back to replyTo queue.
   * @param {import('amqplib').Message} msg
   * @param {any} response
   * @returns {void}
   */
  _reply(msg, response) {
    const replyTo = msg.properties?.replyTo
    if (!replyTo) return

    this.channel.sendToQueue(
      replyTo,
      Buffer.from(JSON.stringify(response)),
      {correlationId: msg.properties.correlationId},
    )
  }
}
