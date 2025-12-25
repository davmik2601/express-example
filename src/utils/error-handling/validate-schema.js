import {ZodError} from 'zod'

/**
 * Middleware function that handles Partner Authentication.
 * This function checks the incoming payload and validates it
 *
 * If the validation fails it returns the error with status code {422}
 * If the validation is successful it will pass to the next function in line
 *
 * For more info about Zod please refer to :
 * https://zod.dev/
 *
 * @template T
 * @param {import('zod').ZodSchema<T>} schema - Zod schema object
 * @param {'body' | 'params' | 'query'} [objectKey='body']
 * @returns {import('express').RequestHandler}
 */
export const validateSchema =
  (schema, objectKey = 'body') =>
    (req, res, next) => {
      try {
        // we can add schema.passthrough().parse(...) for allowing extra fields
        const parsed = schema.parse(req[objectKey] ?? {})

        // Zod Schema can transform data, so redefine or mutate the request object to store parsed data
        Object.defineProperty(req, objectKey, {
          ...Object.getOwnPropertyDescriptor(req, objectKey),
          value: parsed,
          writable: true,
        })

        next()
      } catch (err) {
        let errorObj = {
          statusCode: 422,
          field: '',
          code: '',
          message: err.message ? `Validation failed: ${err.message}` : 'Validation failed',
          errorType: 'Bad Request',
        }

        // Zod validation error
        if (err instanceof ZodError && Array.isArray(err.issues)) {
          const firstFoundIssue = err.issues[0]
          const pathArr = firstFoundIssue.path || []
          const field = firstFoundIssue.path.length ? firstFoundIssue.path.join('.') : ''
          const originalValue = pathArr.reduce((acc, key) => acc?.[key], req[objectKey] ?? {})
          const isRequiredCase = firstFoundIssue.code === 'invalid_type' && originalValue === undefined

          errorObj.message = field
            ? `${field}: ${isRequiredCase ? 'is required' : firstFoundIssue.message}`
            : (isRequiredCase ? 'filed is required' : firstFoundIssue.message)

          errorObj.code = isRequiredCase ? 'required' : firstFoundIssue.code || 'invalid'
          errorObj.field = field
        }

        console.error(errorObj)

        return res.status(422).json(errorObj)
      }
    }

/**
 * @template T
 * @param {import('zod').ZodSchema<T>} schema - Zod schema object
 */
export const validateQuerySchema = (schema) => validateSchema(schema, 'query')

/**
 * @template T
 * @param {import('zod').ZodSchema<T>} schema - Zod schema object
 */
export const validateParamsSchema = (schema) => validateSchema(schema, 'params')
