import {LoginDto} from "./auth/dto/login.dto";
import {LoginType} from "./auth/login.type";
import {RegisterDto} from "./auth/dto/register.dto";
import {SuccessType} from "./success.type";
import {AuthRequestType} from "./auth/auth-request.type";
import {AuthUserType} from "./auth/auth-user.type";

declare global {
  type ZodShapeFor<T> =
    { [K in RequiredKeys<T>]: ZodTypeAny } &
    { [K in OptionalKeys<T>]?: ZodTypeAny }

  type successType = SuccessType

  namespace app {
    type authRequestType = AuthRequestType
    type authUserType = AuthUserType

    namespace auth {
      type loginDto = LoginDto
      type loginType = LoginType
      type registerDto = RegisterDto

    }
  }
}

export {};
