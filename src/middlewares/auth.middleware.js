import {jwtService} from '../services/jwt.service.js'
import {userService} from '../services/user.service.js'
import {UnauthorizedError} from '../utils/error-handling/http-exceptions.js'

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
      return next()
    }
  }

  next(new UnauthorizedError())
}
