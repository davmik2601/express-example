import {authService} from '../services/auth.service.js'

class AuthController {
  /**
   * Register user
   * @param {import('express').Request & {body: RegisterBodySchema}} req
   */
  async register(req) {
    // here we can check some manual validations

    return authService.register(req.body)
  }

  /**
   * Create a test
   * @param {import('express').Request & {body: LoginBodySchema}} req
   */
  async login(req) {
    // here we can check some manual validations

    return authService.login(req.body)
  }
}

export const authController = new AuthController()
