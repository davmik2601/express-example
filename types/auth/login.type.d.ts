import {SuccessType} from "../success.type";

export interface LoginType extends SuccessType {
  token: string;
}
