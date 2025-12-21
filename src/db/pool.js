import 'dotenv/config'
import {Pool, types} from 'pg'

/** @type {{[key: string]: import('pg').Pool}} */
const pools = {}

// Parse bigint (int8) as JS number instead of string
types.setTypeParser(
  types.builtins.INT8,
  (val) => (val === null ? null : parseInt(val, 10)),
)

/** @type {import('pg').Pool} */
export const pool = new Pool({
  host: process.env.PG_HOST,
  port: +process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 15,
  allowExitOnIdle: false, // keeps connections open until idleTimeoutMillis
})

/**
 * @param {string} prefix
 * @param {object} config
 * @returns {import('pg').Pool}
 */
export function getPool(prefix, config) {
  if (pools[prefix]) {
    return pools[prefix]
  }

  pools[prefix] = new Pool({
    ...config,
    max: 10,
    allowExitOnIdle: true,
  })

  return pools[prefix]
}

setInterval(() => {
  try {
    // pg exposes counters directly (no private _pool fields)
    const total = pool.totalCount       // all clients
    const idle = pool.idleCount         // free clients
    const waiting = pool.waitingCount   // queued requests

    if (!idle && total) {
      console.warn('#', getCurrentDatetime(), 'POOL INFO', JSON.stringify([
        total,
        idle,
        waiting,
      ]))
    }
  } catch (e) {
    console.error(e)
  }
}, 10000)
