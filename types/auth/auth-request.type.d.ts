import { Request } from 'express';
import {AuthUserType} from "./auth-user.type";

export interface AuthRequestType extends Request{
  user: AuthUserType;
}
