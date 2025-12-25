import {LimitOffsetDto} from "../../limit-offset.dto"

export interface GetPostsDto extends LimitOffsetDto {
  isPublic?: boolean
}
