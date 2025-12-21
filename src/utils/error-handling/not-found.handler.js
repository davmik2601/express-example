import {NotFoundError} from './http-exceptions.js'

/** @type {import('express').RequestHandler} */
export const notFoundHandler = (req, _res, next) => {
  next(new NotFoundError(  /** @type {MessageOrObject} */ ({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  })))
}
