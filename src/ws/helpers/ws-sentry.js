import * as Sentry from '@sentry/node'
import {randomUUID} from 'node:crypto'

/**
 * Create / normalize request id for WS flows.
 * @param {string|number|undefined|null} rid
 */
export function normalizeRequestId(rid) {
  const v = rid == null ? '' : String(rid)
  return v.length > 0 ? v : randomUUID()
}

/**
 * Apply websocket metadata to current Sentry scope
 * @param {import('@sentry/node').Scope} scope
 * @param {{
 *   stage: 'upgrade'|'open'|'message'|'close'|'ws-delivery',
 *   userId?: number|string,
 *   requestId?: string,
 *   url?: string,
 *   query?: string,
 *   payload?: any,
 * }} opts
 */
export function applyWsScope(scope, opts) {
  const {stage, userId, requestId, url, query, payload} = opts

  scope.setTag('source', 'ws')
  scope.setTag('ws_stage', stage)

  if (requestId) scope.setTag('request_id', String(requestId))
  if (userId != null) scope.setUser({id: String(userId)})

  if (url) scope.setContext('ws', {url, query})
  if (payload !== undefined) scope.setContext('ws_payload', payload)
}

/**
 * Run function inside a WS sentry scope.
 * @template T
 * @param {Parameters<typeof applyWsScope>[1]} meta
 * @param {() => T} fn
 */
export function withWsScope(meta, fn) {
  return Sentry.withScope((scope) => {
    applyWsScope(scope, meta)
    return fn()
  })
}
