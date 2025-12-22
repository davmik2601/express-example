import {z} from 'zod'

/**
 * @typedef {Object} GetPostsQuerySchema
 * @property {boolean} [isPublic]
 */

export const getPostsQuerySchema = z.object({
  isPublic: z.coerce.boolean().optional(),
})
