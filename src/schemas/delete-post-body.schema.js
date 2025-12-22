import {z} from 'zod'

/**
 * @typedef {Object} DeletePostBodySchema
 * @property {number} id
 */

export const deletePostBodySchema = z.object({
  id: z.number().int().positive(),
})
