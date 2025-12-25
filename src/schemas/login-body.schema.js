import {z} from 'zod'

/** @type {import('zod').ZodObject<ZodShapeFor<Auth.LoginDto>>} */
export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().nonempty(),
})
