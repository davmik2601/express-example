import {postService} from '../services/post.service.js'

class PostController {
  /**
   * Create a post
   * @param {AuthRequestType<any, any, Posts.CreatePostDto>} req
   */
  async createPost(req) {
    return postService.createPost(req.user.id, req.body)
  }

  /**
   * Get user posts
   * @param {AuthRequestType<any, any, any, Posts.GetPostsDto>} req
   */
  async getPosts(req) {
    return postService.getPosts(req.user.id, req.query)
  }

  /**
   * Delete the post
   * @param {AuthRequestType<any, any, Posts.DeletePostDto>} req
   */
  async deletePost(req) {
    return postService.deletePost(req.user.id, req.body.id)
  }
}

export const postController = new PostController()
