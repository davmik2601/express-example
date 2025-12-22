import {BadRequestError} from '../utils/error-handling/http-exceptions.js'
import {pool} from '../db/pool.js'

class PostService {
  /**
   * Create a new post by user.
   * @param {number} userId
   * @param {Object} data
   * @param {string} data.text
   * @param {boolean} data.isPublic
   * @returns {Promise<{id: number}>}
   */
  async createPost(userId, {text, isPublic}) {
    // check if user riches post limit
    const {rows: [{postsCount}]} = await pool.query(`
        select count(*) as "postsCount"
        from posts
        where user_id = $1
    `, [userId])

    if (postsCount > 10) {
      throw new BadRequestError('User post limit reached')
    }

    const {rows: [post]} = await pool.query(`
        insert into posts (user_id, text, is_public)
        values ($1, $2, $3)
        returning
            id as "id",
            text as "text",
            is_public as "isPublic",
            created_at as "createdAt"
    `, [userId, text, isPublic])

    return post
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
}

export const postService = new PostService()
