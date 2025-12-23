import {POST_RPC_QUEUE} from '../rabbit-queues.js'
import {RpcClient} from './rpc.client.js'

export class PostRpcClient extends RpcClient {
  constructor() {
    super({queue: POST_RPC_QUEUE, timeoutMs: 5000})
  }

  /**
   * @param {{userId:number}} data
   * @returns {Promise<{allowed:boolean, reason?:string}>}
   */
  async canCreatePost(data) {
    return this.call('canCreatePost', data)
  }
}

export const postRpcClient = new PostRpcClient()
