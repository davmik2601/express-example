import {z} from 'zod'

/**
 * @typedef {Object} LimitOffsetSchema
 * @property {number} [limit=25] 1..100
 * @property {number} [offset=0]  >= 0
 */

export const limitOffsetSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
})
