import {z} from 'zod'

/**
 * @typedef {Object} CreatePostBodySchema
 * @property {string} text
 * @property {boolean} isPublic
 */

export const createPostBodySchema = z.object({
  text: z.string().trim().nonempty().min(1).max(2000),
  isPublic: z.boolean(),
})
