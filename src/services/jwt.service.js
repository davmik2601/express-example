import jwt from 'jsonwebtoken'
import {UnauthorizedError} from '../utils/error-handling/http-exceptions.js'

class JwtService {
  constructor() {
    /** @type {import('jsonwebtoken').Secret} */
    this.secretKey = process.env.JWT_SECRET || 'secret529385627563223'

    /** @type {import('jsonwebtoken').SignOptions['expiresIn']} */
    this.expire = /** @type {any} */ (process.env.JWT_EXPIRE ?? '1h')
  }

  /**
   * Generate JWT token
   * @param {*} payload
   * @returns {string}
   */
  generateToken(payload) {
    return jwt.sign(
      payload,
      this.secretKey,
      this.expire === undefined ? undefined : {expiresIn: this.expire},
    )
  }

  /**
   * Verify JWT token
   * @param {string} token
   * @returns {*}
   */
  verifyToken(token) {
    const decoded =
      /** @type {AuthUserType | undefined} */ jwt.verify(token, this.secretKey)

    if (!decoded) {
      throw new UnauthorizedError('Invalid token')
    }

    return decoded
  }
}

export const jwtService = new JwtService()
