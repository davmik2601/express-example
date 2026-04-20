/**
 * Wraps a controller function so it can return a value
 * and be sent automatically as JSON.
 *
 * @param {(req: Req,
 *         res: Res,
 *         next?: Next) => any | Promise<any>} fn
 * @returns {import('express').RequestHandler}
 */
export const routeHandler = (fn) => {
  return async (req, res, next) => {
    try {
      const result = await fn(req, res, next)

      if (res.headersSent) return

      if (typeof result === 'undefined') {
        res.sendStatus(204)
        return
      }

      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
