import {HttpError} from './http-error.js'

/**
 * A union for message or object payloads.
 * @typedef {string | (Record<string, any> & {message?: string})} MessageOrObject
 */

/** 400 Bad Request */
export class BadRequestError extends HttpError {
  /**
   * @param {MessageOrObject} [messageOrObject='Bad Request']
   */
  constructor(messageOrObject = 'Bad Request') {
    super(400, messageOrObject, 'Bad Request')
  }
}

/** 401 Unauthorized */
export class UnauthorizedError extends HttpError {
  /**
   * @param {MessageOrObject} [messageOrObject='Unauthorized']
   */
  constructor(messageOrObject = 'Unauthorized') {
    super(401, messageOrObject, 'Unauthorized')
  }
}

/** 403 Forbidden */
export class ForbiddenError extends HttpError {
  /**
   * @param {MessageOrObject} [messageOrObject='Forbidden']
   */
  constructor(messageOrObject = 'Forbidden') {
    super(403, messageOrObject, 'Forbidden')
  }
}

/** 404 Not Found */
export class NotFoundError extends HttpError {
  /**
   * @param {MessageOrObject} [messageOrObject='Not Found']
   */
  constructor(messageOrObject = 'Not Found') {
    super(404, messageOrObject, 'Not Found')
  }
}

/** 406 Not Acceptable */
export class NotAcceptableError extends HttpError {
  /**
   * @param {MessageOrObject} [messageOrObject='Not Acceptable']
   */
  constructor(messageOrObject = 'Not Acceptable') {
    super(406, messageOrObject, 'Not Acceptable')
  }
}

/** 409 Conflict */
export class ConflictError extends HttpError {
  /**
   * @param {MessageOrObject} [messageOrObject='Conflict']
   */
  constructor(messageOrObject = 'Conflict') {
    super(409, messageOrObject, 'Conflict')
  }
}

/** 500 Internal Server Error */
export class InternalServerError extends HttpError {
  /**
   * @param {MessageOrObject} [messageOrObject='Internal Server Error']
   */
  constructor(messageOrObject = 'Internal Server Error') {
    super(500, messageOrObject, 'Internal Server Error')
  }
}

/** 402 Payment Required */
export class PaymentRequiredError extends HttpError {
  /**
   * @param {MessageOrObject} [messageOrObject='Payment Required']
   */
  constructor(messageOrObject = 'Payment Required') {
    super(402, messageOrObject, 'Payment Required')
  }
}
