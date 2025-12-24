import {jwtService} from '../services/jwt.service.js'

/**
 * @param {import('uWebSockets.js').HttpRequest} req
 * @returns {string | null}
 */
export function getTokenFromWsUpgrade(req) {
  const q = req.getQuery() || ''

  if (q) {
    const params = new URLSearchParams(q)
    const token = params.get('token')
    if (token) return token
  }

  const proto = req.getHeader('sec-websocket-protocol')
  if (proto && proto !== 'null') return proto

  return null
}

/**
 * @param {string} token
 * @returns {{id:number} | null}
 */
export function verifyWsToken(token) {
  try {
    const payload = jwtService.verifyToken(token)
    const id = Number(payload?.id || payload?.userId)
    if (!id) return null
    return {id}
  } catch {
    return null
  }
}
