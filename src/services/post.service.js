import {BadRequestError, ForbiddenError} from '../utils/error-handling/http-exceptions.js'
import {pool} from '../db/pool.js'
import {postProducer} from '../amqp/producers/post.producer.js'
import {postRpcClient} from '../amqp/clients/post-rpc.client.js'

class PostService {
  /**
   * Create a new post by user.
   * @param {number} userId
   * @param {Object} data
   * @param {string} data.text
   * @param {boolean} data.isPublic
   * @returns {Promise<{
   *   id: number,
   *   userId: number,
   *   text: string,
   *   isPublic: boolean,
   *   createdAt: Date,
   * }>}
   */
  async createPost(userId, {text, isPublic}) {
    // // check if user riches post limit
    // const {rows: [{postsCount}]} = await pool.query(`
    //     select count(*) as "postsCount"
    //     from posts
    //     where user_id = $1
    // `, [userId])
    //
    // if (postsCount > 10) {
    //   throw new ForbiddenError('User post limit reached')
    // }

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
   * Get user posts
   * @param {number} userId
   * @param {Object} data
   * @param {boolean} [data.isPublic]
   * @param {number} [data.offset=0]
   * @param {number} [data.limit=20]
   * @returns {Promise<{
   *   posts: Array<{
   *     id:number,
   *     text: string,
   *     isPublic: boolean,
   *     createdAt: Date,
   *   }>,
   *   meta: MetaType
   * }>}
   */
  async getPosts(userId, {isPublic, offset = 0, limit = 20}) {
    const {rows: posts} =
      /** @type {rows: Array<object & {totalCount: number}>} */
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
