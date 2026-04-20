import 'dotenv/config'
import * as Sentry from '@sentry/node'
import {nodeProfilingIntegration} from '@sentry/profiling-node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  // optional: Express v5 can trigger warnings
  disableInstrumentationWarnings: true,
  // debug: true,
  integrations: [
    Sentry.expressIntegration(),
    nodeProfilingIntegration(),
    Sentry.requestDataIntegration(),
    ...Sentry.getAutoPerformanceIntegrations(),
    Sentry.mysql2Integration(),
    Sentry.postgresIntegration(),
    Sentry.redisIntegration(),
    Sentry.amqplibIntegration(),
  ],
  beforeSend(event, _hint) {
    /** if needed, we can filter out events here */
    // const err = hint?.originalException
    // const code = err?.statusCode ?? err?.status
    // if (typeof code === 'number' && code < 500) {
    //   return null
    // }
    return event
  },
  release: 'express-example',
})
