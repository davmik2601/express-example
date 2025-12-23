import {randomUUID} from 'node:crypto'
import {requestContext} from '../utils/request-context.js'
import * as Sentry from '@sentry/node'

export function requestMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID()

  req.id = requestId
  // keep it also on req + response header (useful for logs / FE)
  res.setHeader('x-request-id', requestId)

  // set request id in Sentry
  Sentry.setTag('request_id', requestId)

  requestContext.run({}, () => {
    // set request id in request context
    requestContext.setRequestId(requestId)
    next()
  })
}
