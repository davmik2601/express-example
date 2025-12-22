import {z} from 'zod'

/**
 * @typedef {Object} LoginBodySchema
 * @property {string} email
 * @property {string} password
 */

export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().nonempty(),
})
