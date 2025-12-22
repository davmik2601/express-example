import {BadRequestError} from '../utils/error-handling/http-exceptions.js'
import {userService} from './user.service.js'
import crypto from 'node:crypto'
import {jwtService} from './jwt.service.js'

class AuthService {
  constructor() {
    this.salt = process.env.SALT || 'salt163036183423278654'
  }

  /**
   * Register user.
   * @param {RegisterBodySchema} data
   * @returns {Promise<{SuccessType}>}
   */
  async register(data) {
    // check if test with the same key exists
    const existingUser = await userService.getUserByEmail(data.email)

    if (existingUser) {
      throw new BadRequestError('User with this email already exists')
    }

    await userService.createUser({
      ...data,
      password: this.hashPassword(data.password),
    })

    return {success: true}
  }

  /**
   * Login user.
   * @param {LoginBodySchema} data
   * @returns {Promise<SuccessType & {token: string}>}
   */
  async login(data) {
    const user = await userService.getUserByEmail(data.email)

    if (user) {
      if(this.verifyPassword(data.password, user.password)) {
        const token = jwtService.generateToken({
          id: user.id,
        })

        return {success: true, token}
      }
    }

    throw new BadRequestError('Invalid email or password')
  }

  /**
   * Hash password
   * @param {string} password
   * @returns {string}
   */
  hashPassword(password) {
    return crypto.createHmac('sha256', this.salt)
      .update(password)
      .digest('hex')
  }

  /**
   * Hash password
   * @param {string} password
   * @param {string} hashedPassword
   * @returns {boolean}
   */
  verifyPassword(password, hashedPassword) {
    const hash = this.hashPassword(password)
    return hash === hashedPassword
  }
}

export const authService = new AuthService()
