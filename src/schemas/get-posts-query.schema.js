import {z} from 'zod'
import {limitOffsetSchema} from '../common/types/limit-offset.schema.js'

/**
 * @typedef {
 * LimitOffsetSchema & {
 *   isPublic?: boolean
 * }} GetPostsQuerySchema
 */

export const getPostsQuerySchema = limitOffsetSchema.extend({
  isPublic: z.coerce.boolean().optional(),
})
