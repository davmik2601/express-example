class UserController {
  /**
   * Get me
   * @param {AuthReq} req
   * @return {Promise<AuthUserType>}
   */
  async getMe(req) {
    return {
      ...req.user,
      // other custom fields here if needed
    }
  }
}

export const userController = new UserController()
