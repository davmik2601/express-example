import {BadRequestError, InternalServerError} from '../utils/error-handling/http-exceptions.js'
import {pool} from '../db/pool.js'

class TestService {
  /**
   * Create a new test.
   * @param {Object} data
   * @param {string} data.key
   * @param {string} data.description
   * @param {number} data.count
   * @param {boolean} data.isActive
   * @returns {Promise<{id: number}>}
   */
  async createTest({key, description, count, isActive}) {
    // check if test with the same key exists
    const {rows: [existingTest]} = await pool.query(`
                select id as "id"
                from tests
                where key = $1`,
      [key])

    if (existingTest) {
      throw new BadRequestError('Test with the same key already exists')
    }

    const {rows: [test]} = await pool.query(`
        insert into tests (key, description, count, is_active)
        values ($1, $2, $3, $4)
        returning id as "id"
    `, [key, description, count, isActive])

    return test
  }

  /**
   * Get tests
   * @param {Object} data
   * @param {number} [data.count]
   * @param {boolean} [data.isActive]
   * @param {number} [data.offset=0]
   * @param {number} [data.limit=20]
   * @returns {Promise<{
   *   tests: Array<{
   *     id:number,
   *     key: string,
   *     description?: string,
   *     count: number,
   *     isActive: boolean
   *   }>,
   *   meta: MetaType
   * }>}
   */
  async getTests({count, isActive, offset = 0, limit = 20}) {
    throw new InternalServerError(`New Error here`)

    const {rows: tests} =
      /** @type {rows: Array<object & {totalCount: number}>} */
      await pool.query(`
        select id               as "id",
               key              as "key",
               description      as "description",
               count            as "count",
               is_active        as "isActive",
               count(*) over () as total_count
        from tests
        where ($1::int is null or count = $1)
          and ($2::boolean is null or is_active = $2)
        order by id desc
        offset $3 limit $4
    `, [count || null, isActive || null, offset, limit])

    return {
      tests: tests.map(({totalCount, ...rest}) => rest),
      meta: {count: Number(tests[0]?.totalCount || 0)},
    }
  }
}

export const testService = new TestService()
