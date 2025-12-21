import {HttpError} from './http-error.js'

/** @type {import('express').ErrorRequestHandler} */
export const errorHandler = (err, req, res, _next) => {
  // Default values
  let statusCode = 500
  let errorType = 'Internal Server Error'
  let message = 'Internal server error'

  /** @type {Record<string, any>} */
  let payload

  if (err instanceof HttpError) {
    statusCode = err.statusCode || 500
    errorType = err.error || 'Internal Server Error'
    message = err.message || message

    payload = typeof err.additionalData === 'object'
      ? {statusCode, message, errorType, ...err.additionalData}
      : {statusCode, message, errorType}
  } else {
    message = err.message || message
    payload = {statusCode, message, errorType}
  }

  console.error(err)

  res.status(statusCode).json(payload)
}
