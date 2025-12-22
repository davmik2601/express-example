import {createRouter} from '../utils/route-handling/create-router.js'
import {validateSchema} from '../utils/error-handling/validate-schema.js'
import {registerBodySchema} from '../schemas/register-body.schema.js'
import {authController} from '../controllers/auth.controller.js'
import {loginBodySchema} from '../schemas/login-body.schema.js'
import {authMiddleware} from '../middlewares/auth.middleware.js'
import {userController} from '../controllers/user.controller.js'

const router = createRouter()

// - Auth routes
router.post('/auth/register', validateSchema(registerBodySchema), authController.register)
router.post('/auth/login', validateSchema(loginBodySchema), authController.login)

// everything below requires auth
router.use(authMiddleware)
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

// - User routes
router.get('/user/me', userController.getMe)

// - Post routes
// ...

export default router
