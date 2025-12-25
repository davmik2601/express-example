import {pool} from '../db/pool.js'

class NotificationService {
  /**
   * Create notification.
   * @param {number} userId
   * @param {Notifications.CreateNotificationDto} data
   * @returns {Promise<Db.Notification>}
   */
  async createNotification(
    userId,
    {type, refId, message},
  ) {
    const {rows: [note]} =
      /** @type {{rows: Array<Db.Notification>}} */
      await pool.query(`
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
