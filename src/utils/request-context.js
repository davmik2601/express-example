import {AsyncLocalStorage} from 'node:async_hooks'

const als = new AsyncLocalStorage()

class RequestContext {
  /**
   * Run function inside request context.
   * @template T
   * @param {{requestId?: string, userId?: number|string}} initial
   * @param {() => T} fn
   */
  run(initial, fn) {
    als.run({...initial}, fn)
  }

  /**
   * @param {string} requestId
   */
  setRequestId(requestId) {
    const store = als.getStore()
    if (store) store.requestId = requestId
  }

  /**
   * @returns {string|undefined}
   */
  getRequestId() {
    return als.getStore()?.requestId
  }

  /**
   * @param {number|string} userId
   */
  setUserId(userId) {
    const store = als.getStore()
    if (store) store.userId = userId
  }

  /**
   * @returns {number|string|undefined}
   */
  getUserId() {
    return als.getStore()?.userId
  }
}

export const requestContext = new RequestContext()
