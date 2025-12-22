import {postService} from '../services/post.service.js'

class PostController {
  /**
   * Create a post
   * @param {AuthRequestType & {body: CreatePostBodySchema}} req
   */
  async createPost(req) {
    return postService.createPost(req.user.id, req.body)
  }

  /**
   * Get user posts
   * @param {AuthRequestType & {query: GetPostsQuerySchema}} req
   */
  async getUserPosts(req) {
    return postService.getPosts(req.user.id, req.query)
  }
}

export const postController = new PostController()
