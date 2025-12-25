import {MetaType} from "../meta.type"

export interface GetPostsType {
  posts: GetPostsItemType[],
  meta: MetaType
}

export interface GetPostsItemType {
  id: number,
  text: string,
  isPublic: boolean,
  createdAt: Date
}
