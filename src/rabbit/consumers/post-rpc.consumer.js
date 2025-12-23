import {RpcConsumer} from './rpc.consumer.js'
import {POST_RPC_QUEUE} from '../rabbit-queues.js'
import {postService} from '../../services/post.service.js'

export class PostRpcConsumer extends RpcConsumer {
  /**
   * @param {{channel: import('amqplib').Channel}} deps
   */
  constructor({channel}) {
    super({queue: POST_RPC_QUEUE, channel, prefetch: 5})
  }

  /**
   * @param {{type:string, data:any}} payload
   * @param {import('amqplib').Message} msg
   * @returns {Promise<any>}
   */
  async handle(payload, msg) { // msg available if you later need correlationId, headers, etc.
    const {type, data} = payload || {}

    switch (type) {
      case 'canCreatePost': {
        const ok = await postService.checkPostLimit(data.userId)
        if (!ok) return {allowed: false, reason: 'Post limit reached'}
        return {allowed: true}
      }

      default: {
        return {allowed: false, reason: 'unknown rpc type'}
      }
    }
  }
}
