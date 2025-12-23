import {Producer} from './producer.js'
import {POST_QUEUE} from '../rabbit-queues.js'

export class PostProducer extends Producer {
  constructor() {
    super({queue: POST_QUEUE})
  }

  /**
   * Low-level send for any post event.
   * @param {string} type
   * @param {any} data
   * @returns {Promise<void>}
   */
  async publish(type, data) {
    return this.send({type, data})
  }

  /**
   * Event: post created
   * @param {{postId:number, userId:number}} data
   * @returns {Promise<void>}
   */
  async postCreated(data) {
    return this.publish('post.created', data)
  }

  /**
   * Event: post deleted
   * @param {{postId:number, userId:number}} data
   * @returns {Promise<void>}
   */
  async postDeleted(data) {
    return this.publish('post.deleted', data)
  }
}

export const postProducer = new PostProducer()
