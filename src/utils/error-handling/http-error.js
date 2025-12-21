/**
 * A union for message or object payloads.
 * @typedef {string | (Record<string, any> & {message?: string})} MessageOrObject
 */

export class HttpError extends Error {
  /**
   * @param {number} statusCode
   * @param {MessageOrObject} messageOrObject
   * @param {string} errorType
   */
  constructor(statusCode, messageOrObject, errorType) {
    const message = typeof messageOrObject === 'string'
      ? messageOrObject
      : messageOrObject.message || errorType

    super(message)

    this.statusCode = statusCode
    this.message = message
    this.error = errorType

    if (typeof messageOrObject === 'object') {
      this.additionalData = messageOrObject
      Object.assign(this, messageOrObject)
    }

    this.name = this.constructor.name
    Error.captureStackTrace?.(this, this.constructor)
  }
}
