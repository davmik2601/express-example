class UserController {
  /**
   * Get me
   * @param {AuthRequestType} req
   */
  async getMe(req) {
    // if needed, we can get and fill other data from user here
    return {
      ...req.user,
      // other custom fields here if needed
    }
  }
}

export const userController = new UserController()
