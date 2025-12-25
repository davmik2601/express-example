import {BadRequestError, ForbiddenError} from '../utils/error-handling/http-exceptions.js'
import {pool} from '../db/pool.js'
import {postProducer} from '../rabbit/producers/post.producer.js'
import {postRpcClient} from '../rabbit/clients/post-rpc.client.js'

class PostService {
  /**
   * Create a new post by user.
   * @param {number} userId
   * @param {Posts.CreatePostDto} data
   * @returns {Promise<Posts.CreatePostType>}
   */
  async createPost(userId, {text, isPublic}) {
    const rpcResp = await postRpcClient.canCreatePost({userId})

    if (!rpcResp.allowed) {
      throw new ForbiddenError(rpcResp.reason || 'Not allowed')
    }

    const {rows: [post]} = await pool.query(`
        insert into posts (user_id, text, is_public)
        values ($1, $2, $3)
        returning
            id as "id",
            user_id as "userId",
            text as "text",
            is_public as "isPublic",
            created_at as "createdAt"
    `, [userId, text, isPublic])

    // async work trigger
    await postProducer.postCreated({postId: post.id, userId: post.userId})

    return post
  }

  /**
   * Check if user can create a post
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  async checkPostLimit(userId) {
    const {rows: [{count}]} = await pool.query(`
        select count(*)::int as "count"
        from posts
        where user_id = $1
    `, [userId])

    return count < 10
  }

  /**
   * Get posts
   * @param {number} userId
   * @param {Posts.GetPostsDto} data
   * @returns {Promise<Posts.GetPostsType>}
   */
  async getPosts(userId, {isPublic, offset = 0, limit = 20}) {
    const {rows: posts} =
      /** @type {{rows: Array<
       *   Pick<Db.Post, 'id' | 'text' | 'isPublic' | 'createdAt'>
       *   & {totalCount: number}
       * >}} */
      await pool.query(`
          select id               as "id",
                 text             as "text",
                 is_public        as "isPublic",
                 created_at       as "createdAt",
                 count(*) over () as "totalCount"
          from posts
          where user_id = $1
            and ($2::boolean is null or is_public = $2)
          order by id desc
          offset $3 limit $4
      `, [userId, isPublic || null, offset, limit])

    return {
      posts: posts.map(({totalCount, ...rest}) => rest), // exclude totalCount from posts
      meta: {count: Number(posts[0]?.totalCount || 0)},
    }
  }

  /**
   * Delete a user post
   * @param {number} userId
   * @param {number} postId
   * @returns {Promise<SuccessType>}
   */
  async deletePost(userId, postId) {
    const {rows: [post]} = await pool.query(`
        select id      as "id",
               user_id as "userId"
        from posts
        where id = $1
    `, [postId])

    if (!post) {
      throw new BadRequestError('Post not found')
    }
    if (post.userId !== userId) {
      throw new ForbiddenError('You have not access to delete this post')
    }

    await pool.query(`
        delete
        from posts
        where id = $1
    `, [postId])

    // async work trigger
    await postProducer.postDeleted({postId, userId})

    return {success: true}
  }
}

export const postService = new PostService()
