/**
 * Get IP address from request
 * @param {import('express').Request} req
 * @returns {string} IP address
 */
export function getIP(req) {
  const forwarded =
    req.headers['x-forwarded-for']?.toString() ||
    req.headers['x-real-ip']?.toString() ||
    req.socket.remoteAddress
  let ip = forwarded
  if (forwarded && forwarded.indexOf(':') >= 0) {
    const explodedString = forwarded.split(':')
    ip = explodedString[explodedString.length - 1]
  }
  if (ip === '1') {
    ip = '127.0.0.1'
  }

  return ip
}
