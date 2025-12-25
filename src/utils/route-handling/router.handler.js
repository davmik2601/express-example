/**
 * Wraps a controller function so it can return a value
 * and be sent automatically as JSON.
 *
 * @template ReqBody, ResBody
 * @param {(req: import('express').Request<{}, {}, ReqBody>,
 *         res: import('express').Response<ResBody>,
 *         next?: import('express').NextFunction) => any | Promise<any>} fn
 * @returns {import('express').RequestHandler}
 */
export const routeHandler = (fn) => {
  return async (req, res, next) => {
    try {
      const result = await fn(req, res, next)

      // if controller already responded or returned nothing, don't auto-json
      if (res.headersSent || typeof result === 'undefined') return

      res.json(result)
    } catch (err) {
      next(err) // Passes error to Express error handler
    }
  }
}
