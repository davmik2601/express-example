import {z} from 'zod'

/**
 * @typedef {Object} CreateTestBodySchema
 * @property {string} key
 * @property {string} [description]
 * @property {number} count
 * @property {boolean} isActive
 */

export const createTestBodySchema = z.object({
  key: z.string().trim().toLowerCase().nonempty(),
  description: z.string().max(1000).optional(),
  count: z.number().int().positive(),
  isActive: z.boolean(),
})
