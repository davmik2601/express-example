class UserController {
  /**
   * Get me
   * @param {AuthRequestType} req
   */
  async getMe(req) {
    return {
      ...req.user,
      // other custom fields here if needed
    }
  }
}

export const userController = new UserController()
