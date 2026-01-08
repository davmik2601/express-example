import type {Request} from 'express-serve-static-core'

/** we are re-declaring the 5 params of express Request type here
 * to make it easier to use "generics" in the future
 */
export interface AuthRequestType<P = any, ResBody = any, ReqBody = any, ReqQuery = any, Locals = any>
  extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user: AuthUserType
}
