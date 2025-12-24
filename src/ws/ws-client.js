/**
 * ws clients registry
 * userId -> Set(ws)   (multi-tab)
 *
 * If you want "only 1 ws per user" (like crashgame),
 * change Set to single ws (see comment below).
 */
export class WsClient {
  constructor() {
    /** @type {Map<number, Set<any>>} */
    this.byUser = new Map()
  }

  /**
   * add ws for user
   * @param {number} userId
   * @param {any} ws
   */
  add(userId, ws) {
    let set = this.byUser.get(userId)
    if (!set) this.byUser.set(userId, (set = new Set()))
    set.add(ws)
  }

  /**
   * remove ws for user
   * @param {number} userId
   * @param {any} ws
   */
  remove(userId, ws) {
    const set = this.byUser.get(userId)
    if (!set) return
    set.delete(ws)
    if (set.size === 0) this.byUser.delete(userId)
  }

  /**
   * remove ws from all users (simple + safe)
   * @param {any} ws
   */
  removeEverywhere(ws) {
    for (const [userId, set] of this.byUser.entries()) {
      set.delete(ws)
      if (set.size === 0) this.byUser.delete(userId)
    }
  }

  /**
   * send to user all active sockets
   * @param {number} userId
   * @param {string|Uint8Array|ArrayBuffer} payload
   * @param {boolean} [isBinary]
   */
  sendToUser(userId, payload, isBinary = false) {
    console.log({userId, payload, isBinary})
    const set = this.byUser.get(userId)
    if (!set || set.size === 0) return 0

    let sent = 0
    for (const ws of set) {
      try {
        ws.send(payload, isBinary)
        sent++
      } catch {
        set.delete(ws) // broken socket
      }
    }

    if (set.size === 0) this.byUser.delete(userId)
    return sent
  }

  /**
   * optional: kick old sockets (if you want 1 per user)
   * @param {number} userId
   * @param {any} keepWs
   */
  kickOthers(userId, keepWs) {
    const set = this.byUser.get(userId)
    if (!set) return

    for (const ws of set) {
      if (ws === keepWs) continue
      try {
        ws.end?.(1000, 'replaced')
      } catch {}
      set.delete(ws)
    }
    if (set.size === 0) this.byUser.delete(userId)
  }

  stats() {
    let connections = 0
    for (const set of this.byUser.values()) connections += set.size
    return {usersOnline: this.byUser.size, connections}
  }
}

export const wsClient = new WsClient()
