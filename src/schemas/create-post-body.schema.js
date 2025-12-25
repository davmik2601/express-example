import {z} from 'zod'

/** @type {import('zod').ZodObject<ZodShapeFor<Posts.CreatePostDto>>} */
export const createPostBodySchema = z.object({
  text: z.string().trim().nonempty().min(1).max(2000),
  isPublic: z.boolean(),
})
