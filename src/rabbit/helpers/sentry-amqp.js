/**
 * Apply AMQP metadata to a Sentry scope.
 * @param {import('@sentry/node').Scope} scope
 * @param {{
 *   kind: 'rpc'|'event'|'rpc-client'|'producer',
 *   queue?: string,
 *   payload?: any,
 *   msg?: import('amqplib').Message,
 *   correlationId?: string,
 *   typeTagName?: string,
 *   typeValue?: string,
 * }} opts
 */
export function applyAmqpScope(scope, opts) {
  const {
    kind,
    queue,
    payload,
    msg,
    correlationId,
    typeTagName,
    typeValue,
  } = opts

  scope.setTag('source', 'amqp')
  scope.setTag('kind', kind)
  if (queue) scope.setTag('queue', queue)

  const headers = msg?.properties?.headers || {}
  const requestId = headers.request_id
  const userId = headers.user_id

  if (requestId) scope.setTag('request_id', String(requestId))
  if (userId) scope.setUser({id: String(userId)})

  const corr = correlationId || msg?.properties?.correlationId
  if (corr) scope.setTag('correlation_id', String(corr))

  if (typeTagName && typeValue) scope.setTag(typeTagName, String(typeValue))

  if (payload !== undefined) scope.setContext('amqp_payload', payload)
}
