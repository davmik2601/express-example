import {authService} from '../services/auth.service.js'

class AuthController {
  /**
   * Register user
   * @param {import('express').Request & {body: RegisterBodySchema}} req
   */
  async register(req) {
    return authService.register(req.body)
  }

  /**
   * Login user
   * @param {import('express').Request & {body: LoginBodySchema}} req
   */
  async login(req) {
    return authService.login(req.body)
  }
}

export const authController = new AuthController()
