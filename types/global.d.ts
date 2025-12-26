declare global {
  /** Global types
   * * * * * * * * * * * * * * * * * * * * * * * * * */

  // can be moved to a separate file like "express.d.ts" if needed
  namespace Express {
    interface Request {
      id: string,
      user?: AuthUserType,
      // other custom properties can be added here for req
    }
  }

  // can be moved to a separate file like "env.d.ts" if needed
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production',
      PORT?: string,
      WS_PORT: string,
      PG_HOST: string,
      PG_PORT: string,
      PG_USER: string,
      PG_PASSWORD: string,
      PG_DATABASE: string,
      SENTRY_DSN: string,
      JWT_SECRET: string,
      JWT_EXPIRE: string,
      AMQP_URL: string,
      SALT?: string,
      // other custom env variables can be added here
    }
  }

  type ZodShapeFor<T> =
    { [K in RequiredKeys<T>]: ZodTypeAny } &
    { [K in OptionalKeys<T>]?: ZodTypeAny }

  type SuccessType = import('./success.type').SuccessType
  type LimitOffsetDto = import('./limit-offset.dto').LimitOffsetDto
  type MetaType = import('./meta.type').MetaType

  type AuthRequestType = import('./auth/auth-request.type').AuthRequestType
  type AuthUserType = import('./auth/auth-user.type').AuthUserType

  /** Namespaces with types
   * * * * * * * * * * * * * * * * * * * * * * * * * */

  namespace Auth {
    type LoginDto = import('./auth/dto/login.dto').LoginDto
    type LoginType = import('./auth/login.type').LoginType
    type RegisterDto = import('./auth/dto/register.dto').RegisterDto
  }

  namespace Posts {
    type CreatePostDto = import('./post/dto/create-post.dto').CreatePostDto
    type CreatePostType = import('./post/create-post.type').CreatePostType
    type DeletePostDto = import('./post/dto/delete-post.dto').DeletePostDto
    type GetPostsDto = import('./post/dto/get-posts.dto').GetPostsDto
    type GetPostsType = import('./post/get-posts.type').GetPostsType
  }

  namespace Notifications {
    type CreateNotificationDto = import('./notification/dto/create-notification.dto').CreateNotificationDto
  }

  /** Db model types
   * * * * * * * * * * * * * * * * * * * * * * * * * */

  namespace Db {
    type User = import('./user/user.d.ts').User
    type Post = import('./post/post.d.ts').Post
    type Notification = import('./notification/notification.d.ts').Notification
  }
}

export {}
