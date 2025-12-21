import {createRouter} from '../utils/route-handling/create-router.js'
import {validateQuerySchema, validateSchema} from '../utils/error-handling/validate-schema.js'
import {testController} from '../controllers/test.controller.js'
import {createTestBodySchema} from '../schemas/create-test-body.schema.js'
import {getTestsQuerySchema} from '../schemas/get-tests-query.schema.js'

const router = createRouter()

// create test
router.post('/test/create', validateSchema(createTestBodySchema), testController.createTest)
// get tests
router.get('/test/get-all', validateQuerySchema(getTestsQuerySchema), testController.getTests)

export default router
