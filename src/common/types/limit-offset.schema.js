import {z} from 'zod'

/** @type {import('zod').ZodObject<ZodShapeFor<LimitOffsetDto>>} */
export const limitOffsetSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
})
