import type {ParsedQs} from 'qs'

declare global {
  namespace Express {
    // add here ALL global custom properties for global express req
    interface Request {
      id: string,

      // AuthReq properties
      user: AuthUserType,

      // OtherReq properties
      field1: string,
      field2: string,

      // ... other custom properties can be added here for req
      // Important: here all properties MUST BE REQUIRED !!!
    }
  }

  type Req<B = any, Q = ParsedQs, P = any> =
    import('express').Request<P, any, B, Q, any>
    | AuthReq<B, Q, P>
    | OtherReq<B, Q, P>

  type AuthReq<B = any, Q = ParsedQs, P = any> = Omit<
    import('express').Request<P, any, B, Q, any>,
    'field1' | 'field2'
  > & { field1?: string, field2?: string }

  type OtherReq<B = any, Q = ParsedQs, P = any> = Omit<
    import('express').Request<P, any, B, Q, any>,
    'user'
  >

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * These are the default types from express
   *
   */
  type Res<ResBody = any, Locals = any> = import('express').Response<ResBody, Locals>
  type Next = import('express').NextFunction
  type Err = any
}

export {}
