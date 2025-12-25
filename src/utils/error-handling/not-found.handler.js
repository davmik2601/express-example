import {NotFoundError} from './http-exceptions.js'

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export const notFoundHandler = (req, _res, next) => {
  next(new NotFoundError({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  }))
}
