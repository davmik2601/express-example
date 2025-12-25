import {authService} from '../services/auth.service.js'

class AuthController {
  /**
   * Register user
   * @param {import('express').Request & { body: Auth.RegisterDto }} req
   * @returns {Promise<SuccessType>}
   */
  async register(req) {
    return authService.register(req.body)
  }

  /**
   * Login user
   * @param {import('express').Request & { body: Auth.LoginDto }} req
   */
  async login(req) {
    return authService.login(req.body)
  }
}

export const authController = new AuthController()
