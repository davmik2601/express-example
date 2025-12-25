export interface CreatePostType {
  id: number,
  userId: number,
  text: string,
  isPublic: boolean,
  createdAt: Date
}
