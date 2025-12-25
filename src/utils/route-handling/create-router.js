import {Router} from 'express'
import {routeHandler} from './router.handler.js'

/**
 * Creates an Express Router where all route handlers (controller functions)
 * are automatically wrapped with `routeHandler`.
 * This avoids having to manually do:
 * Notes:
 * - Middlewares are not affected (only functions are wrapped).
 * - Supports: `get`, `post`, `put`, `patch`, `delete`.
 *
 * @returns {import('express').Router}
 */
export const createRouter = () => {
  const router = Router()
  const methods = ['get', 'post', 'put', 'patch', 'delete']

  for (const method of methods) {
    const m = /** @type {'get'|'post'|'put'|'patch'|'delete'} */ (method)
    /** @type {Function} */
    const original = router[m]

    /**
     * @param {import('express-serve-static-core').PathParams} path
     * @param  {...import('express-serve-static-core').RequestHandlerParams} handlers
     */
    router[m] = (path, ...handlers) => {
      // flatten in case someone passes arrays of handlers
      const flat = handlers.flat()

      // find the last middleware position (fn with arity >= 3: (req,res,next))
      let lastMwIndex = -1
      for (let i = flat.length - 1; i >= 0; i--) {
        const h = flat[i]
        if (typeof h === 'function' && h.length >= 3) {
          lastMwIndex = i
          break
        }
      }

      // wrap only functions AFTER the last middleware; leave middlewares as-is
      const wrapped = flat.map((h, i) =>
        typeof h === 'function' && i > lastMwIndex
          ? routeHandler(
            /** @type {(req: import('express').Request,
             *          res: import('express').Response,
             *          next?: import('express').NextFunction) => any}
             */ (h),
          )
          : h,
      )

      return original.call(router, path, ...wrapped)
    }
  }

  return router
}

