import {z} from 'zod'
import {limitOffsetSchema} from '../common/types/limit-offset.schema.js'

/** @type {import('zod').ZodObject<ZodShapeFor<Posts.GetPostsDto>>} */
export const getPostsQuerySchema = limitOffsetSchema.extend({
  isPublic: z.coerce.boolean().optional(),
})
