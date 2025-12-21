import {testService} from '../services/test.service.js'

class TestController {
  /**
   * Create a test
   * @param {import('express').Request & {body: CreateTestBodySchema}} req
   */
  async createTest(req) {
    // here we can check some manual validations

    return testService.createTest(req.body)
  }

  /**
   * Get tests
   * @param {import('express').Request & {query: GetTestsQuerySchema}} req
   */
  async getTests(req) {
    // here we can check some manual validations

    return testService.getTests(req.query)
  }
}

export const testController = new TestController()
