/**
 * Wraps a controller function so it can return a value
 * and be sent automatically as JSON.
 *
 * @template ReqBody, ResBody
 * @param {(req: import('express').Request<{}, {}, ReqBody>, res: import('express').Response<ResBody>) => any | Promise<any>} fn
 * @returns {import('express').RequestHandler}  <-- tells IDE this is a valid router handler
 */
export const routeHandler = (fn) => {
  return async (req, res, next) => {
    try {
      const result = await fn(req, res)
      res.json(result)
    } catch (err) {
      next(err) // Passes error to Express error handler
    }
  }
}
