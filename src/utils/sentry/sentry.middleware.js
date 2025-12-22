import * as Sentry from '@sentry/node'
import {v4 as uuidV4} from 'uuid'

/**
 * Sentry middleware to capture request details and start a transaction.
 * @param {import('express').Request & {user?: *}} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
export async function sentryMiddleware(req, res, next) {
  /** @type {string} */
  const requestId = req.headers['x-request-id'] || uuidV4()
  req.id = requestId
  res.setHeader('x-request-id', requestId)

  Sentry.setTag('request_id', requestId)

  // // set user info if available.
  // // Better: set user in auth middleware (recommended).
  // if (req.user) {
  //   Sentry.setUser({
  //     id: req.user?.id,
  //     username: req.user?.username,
  //     ip_address: getIP(req),
  //   })
  // } else {
  //   Sentry.setUser(null)
  // }

  next()
}
