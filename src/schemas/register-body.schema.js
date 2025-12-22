import {z} from 'zod'

/**
 * @typedef {Object} RegisterBodySchema
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {number} [age]
 */

export const registerBodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(6).max(100),
  age: z.number().int().positive().optional(),
})
