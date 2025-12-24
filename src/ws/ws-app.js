import * as Sentry from '@sentry/node'
import uWS from 'uWebSockets.js'
import {wsClient} from './ws-client.js'
import {getTokenFromWsUpgrade, verifyWsToken} from './ws-auth.js'
import {startWsDeliveryConsumer} from './ws-bootstrap.js'
import {withWsScope, normalizeRequestId} from './helpers/ws-sentry.js'

export class WsApp {
  constructor({port}) {
    this.port = Number(port)
    this.app = uWS.App()
  }

  async init() {
    // init uSocket / uWebSockets
    await this._initServer()

    // start ws-related rabbit consumers
    await startWsDeliveryConsumer()
  }

  _initServer() {
    this.app.get('/ws/health', (res) => {
      res.writeStatus('200 OK').end(JSON.stringify({ok: true, ...wsClient.stats()}))
    })

    this.app.ws('/ws/*', {
      compression: 0,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 60,

      upgrade: (res, req, ctx) => {
        let aborted = false
        res.onAborted(() => {
          aborted = true
        })

        const url = req.getUrl()
        const query = req.getQuery()

        // optional: if you pass ?rid=... from client you can parse it yourself.
        // easiest: always generate
        const requestId = normalizeRequestId(null)

        const token = getTokenFromWsUpgrade(req)
        const user = token ? verifyWsToken(token) : null

        return withWsScope(
          {stage: 'upgrade', userId: user?.id, requestId, url, query},
          () => {
            try {
              if (!user) {
                // if you want to see auth fails in Sentry:
                Sentry.captureMessage('ws unauthorized', 'warning')
                if (!aborted) res.writeStatus('401 Unauthorized').end('Unauthorized')
                return
              }
              if (aborted) return

              res.upgrade(
                {userId: user.id, requestId},
                req.getHeader('sec-websocket-key'),
                req.getHeader('sec-websocket-protocol'),
                req.getHeader('sec-websocket-extensions'),
                ctx,
              )
            } catch (err) {
              Sentry.captureException(err)
              if (!aborted) res.writeStatus('500 Internal Server Error').end('ws upgrade error')
            }
          },
        )
      },

      open: (ws) => {
        const {userId, requestId} = ws.getUserData() || {}

        return withWsScope({stage: 'open', userId, requestId}, () => {
          try {
            if (userId) wsClient.add(Number(userId), ws)

            // if you want only 1 tab per user:
            // if (userId) wsClient.kickOthers(Number(userId), ws)

            ws.send(JSON.stringify({type: 'hello', data: {userId}}))
          } catch (err) {
            Sentry.captureException(err)
          }
        })
      },

      message: (ws, message, isBinary) => {
        const {userId, requestId} = ws.getUserData() || {}

        return withWsScope({stage: 'message', userId, requestId}, () => {
          try {
            if (isBinary) return

            const text = Buffer.from(message).toString('utf8')

            if (text === 'ping') {
              ws.send('pong')
              return
            }

            ws.send(JSON.stringify({type: 'echo', data: text}))
          } catch (err) {
            Sentry.captureException(err)
          }
        })
      },


      close: (ws) => {
        const {userId, requestId} = ws.getUserData() || {}

        return withWsScope({stage: 'close', userId, requestId}, () => {
          try {
            if (userId) wsClient.remove(Number(userId), ws)
            else wsClient.removeEverywhere(ws)
          } catch (err) {
            Sentry.captureException(err)
          }
        })
      },
    })

    return new Promise((resolve, reject) => {
      this.app.listen(this.port, (token) => {
        if (!token) return reject(new Error(`ws failed to listen on ${this.port}`))
        console.log(`ws listening on ws://localhost:${this.port}/ws`)
        resolve()
      })
    })
  }
}
