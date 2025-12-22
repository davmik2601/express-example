import * as Sentry from '@sentry/node'
import {nodeProfilingIntegration} from '@sentry/profiling-node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  // debug: true,
  integrations: [
    Sentry.expressIntegration(),
    nodeProfilingIntegration(),
    Sentry.prismaIntegration(),
    Sentry.getAutoPerformanceIntegrations(),
    Sentry.mysql2Integration(),
    Sentry.redisIntegration(),
    Sentry.requestDataIntegration(),
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
