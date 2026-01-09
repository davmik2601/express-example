import {NotFoundError} from './http-exceptions.js'

/**
 * @param {Req} req
 * @param {Res} _res
 * @param {Next} next
 */
export const notFoundHandler = (req, _res, next) => {
  next(new NotFoundError({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  }))
}
