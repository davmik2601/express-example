import * as Sentry from '@sentry/node'
import {applyAmqpScope} from '../helpers/sentry-amqp.js'

/**
 * Base class for RabbitMQ event consumers (no response expected).
 * - parses JSON
 * - sets Sentry context
 * - calls child handler
 * - ACK on success
 * - NACK on error (drop by default, can be changed to requeue)
 */
export class Consumer {
  /**
   * @param {{
   *   queue: string,
   *   channel: import('amqplib').Channel,
   *   prefetch?: number,
   *   requeueOnError?: boolean,
   * }} options
   */
  constructor({queue, channel, prefetch = 10, requeueOnError = false}) {
    this.queue = queue
    this.channel = channel
    this.prefetch = prefetch
    this.requeueOnError = requeueOnError
  }

  /**
   * Start consuming events.
   * @returns {Promise<void>}
   */
  async start() {
    await this.channel.assertQueue(this.queue, {durable: true})
    this.channel.prefetch(this.prefetch)

    console.log(`✅ Worker is listening: ${this.queue}`)

    await this.channel.consume(this.queue, this._onRawMessage.bind(this), {noAck: false})
  }

  /**
   * Child class must implement this.
   * @param {any} _payload
   * @param {import('amqplib').Message} _msg
   * @returns {Promise<void>}
   */
  async handle(_payload, _msg) {
    throw new Error('handle() not implemented')
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

      await Sentry.withScope(async (scope) => {
        applyAmqpScope(scope, {
          kind: 'event',
          queue: this.queue,
          payload,
          msg,
          typeTagName: 'event_type',
          typeValue: payload?.type,
        })
        await this.handle(payload, msg)
      })

      this.channel.ack(msg, false)
    } catch (err) {
      console.error(err)

      Sentry.withScope((scope) => {
        applyAmqpScope(scope, {kind: 'event', queue: this.queue, payload, msg})
        Sentry.captureException(err)
      })

      // For events: decide retry/drop policy
      this.channel.nack(msg, false, this.requeueOnError)
    }
  }
}
