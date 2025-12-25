import {z} from 'zod'

/** @type {import('zod').ZodObject<ZodShapeFor<Posts.DeletePostDto>>} */
export const deletePostBodySchema = z.object({
  id: z.number().int().positive(),
})
