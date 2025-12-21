import {z} from 'zod'

/**
 * @typedef {Object} GetTestsQuerySchema
 * @property {number} [count]
 * @property {boolean} [isActive]
 */

export const getTestsQuerySchema = z.object({
  count: z.coerce.number().int().positive().optional(),
  isActive: z.coerce.boolean().optional(),
})
