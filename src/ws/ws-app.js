import uWS from 'uWebSockets.js'
import {wsClient} from './ws-client.js'
import {getTokenFromWsUpgrade, verifyWsToken} from './ws-auth.js'
import {startWsDeliveryConsumer} from './ws-bootstrap.js'

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
      console.log('>>> HEALTH HIT')
      res.writeStatus('200 OK').end(JSON.stringify({ok: true, ...wsClient.stats()}))
    })

    this.app.any('/*', (res, req) => {
      console.error('[HTTP]', req.getMethod(), req.getUrl(), req.getQuery())
      res.writeStatus('404 Not Found').end('not a ws route')
    })

    this.app.ws('/ws/*', {
      compression: 0,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 60,

      upgrade: (res, req, ctx) => {
        console.log('[UPGRADE-1]', req.getUrl(), req.getQuery())

        let aborted = false
        res.onAborted(() => {
          aborted = true
        })

        const token = getTokenFromWsUpgrade(req)
        console.log('[UPGRADE-2] token?', token ? 'yes' : 'no')
        const user = token ? verifyWsToken(token) : null
        console.log('[UPGRADE-3] user?', user ? String(user.id) : 'null')

        if (!user) {
          if (!aborted) res.writeStatus('401 Unauthorized').end('Unauthorized')
          return
        }

        if (aborted) return

        res.upgrade(
          {userId: user.id},
          req.getHeader('sec-websocket-key'),
          req.getHeader('sec-websocket-protocol'),
          req.getHeader('sec-websocket-extensions'),
          ctx,
        )
      },

      open: (ws) => {
        const {userId} = ws.getUserData() || {}
        console.log('[OPEN]', String(userId))
        if (userId) wsClient.add(Number(userId), ws)

        // if you want only 1 tab per user:
        // if (userId) wsClient.kickOthers(Number(userId), ws)

        ws.send(JSON.stringify({type: 'hello', data: {userId}}))
      },

      message: (ws, message, isBinary) => {
        if (isBinary) return
        const text = Buffer.from(message).toString('utf8')

        if (text === 'ping') {
          ws.send('pong')
          return
        }

        ws.send(JSON.stringify({type: 'echo', data: text}))
      },

      close: (ws) => {
        const {userId} = ws.getUserData() || {}
        // console.log('[CLOSE]', String(userId))
        console.log('[CLOSE]', String(userId))
        if (userId) wsClient.remove(Number(userId), ws)
        else wsClient.removeEverywhere(ws)
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
