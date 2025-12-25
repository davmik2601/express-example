import {z} from 'zod'

/** @type {import('zod').ZodObject<ZodShapeFor<Auth.RegisterDto>>} */
export const registerBodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(6).max(100),
  age: z.number().int().positive().optional(),
})
