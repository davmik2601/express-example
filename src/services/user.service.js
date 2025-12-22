import {pool} from '../db/pool.js'

class UserService {
  /**
   * Creates a new user
   * @param {Object} data
   * @param {string} data.name
   * @param {string} data.email
   * @param {string} data.password
   * @param {number} [data.age]
   * @returns {Promise<{id: number}>}
   */
  async createUser({name, email, password, age}) {
    const {rows: [user]} = await pool.query(`
        insert into users (name, email, password, age)
        values ($1, $2, $3, $4)
        returning id as "id"
    `, [name, email, password, age])

    return user
  }

  /**
   * Gets a user by email
   * @param {string} email
   * @returns {Promise<{id: number, password: string} | null>}
   */
  async getUserByEmail(email) {
    const {rows: [user]} = await pool.query(`
        select id       as "id",
               password as "password"
        from users
        where email = $1
    `, [email])

    return user
  }

  /**
   * Gets a user by ID
   * @param {number} id
   * @returns {Promise<{id: number, name: string, email: string, age?: number} | null>}
   */
  async getById(id) {
    const {rows: [user]} = await pool.query(`
        select id    as "id",
               name  as "name",
               email as "email",
               age   as "age"
        from users
        where id = $1
    `, [id])

    return user || null
  }
}

export const userService = new UserService()
