import {jwtService} from '../services/jwt.service.js'
import {userService} from '../services/user.service.js'
import {UnauthorizedError} from '../utils/error-handling/http-exceptions.js'
import * as Sentry from '@sentry/node'
import {getIP} from '../utils/get-ip.js'
import {requestContext} from '../utils/request-context.js'

export async function authMiddleware(req, res, next) {

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next(new UnauthorizedError())
  }

  const tokenInfo = jwtService.verifyToken(token)

  if (tokenInfo?.id) {
    const user = await userService.getById(tokenInfo.id)
    if (user) {
      req.user = user

      // set user id in request context
      requestContext.setUserId(req.user.id)

      // set user info in Sentry
      Sentry.setUser({
        id: user.id,
        email: user.email,
        ip_address: getIP(req),
      })

      return next()
    }
  }

  next(new UnauthorizedError())
}
