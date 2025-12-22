import {pool} from '../db/pool.js'

class NotificationService {
  /**
   * Create notification.
   * @param {number} userId
   * @param {Object} data
   * @param {string} data.type
   * @param {number} [data.refId]
   * @param {string} data.message
   * @returns {Promise<{
   *   id: number,
   *   userId: number,
   *   type: string,
   *   refId?: number,
   *   message: string,
   *   createdAt: Date,
   * }>}
   */
  async createNotification(
    userId,
    {type, refId, message},
  ) {
    const {rows: [note]} = await pool.query(`
        insert into notifications (user_id, type, ref_id, message)
        values ($1, $2, $3, $4)
        returning
            id as "id",
            user_id as "userId",
            type as "type",
            ref_id as "refId",
            message as "message",
            created_at as "createdAt"
    `, [userId, type, refId, message])

    return note
  }
}

export const notificationService = new NotificationService()
