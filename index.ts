/* eslint-disable no-console */
import processClose from './processClose'
import processFetch from './processFetch'
import processMessage from './processMessage'
import processOpen from './processOpen'
import WebSocketServerProps from './src/types/WebSocketServerProps'

const users: { [key: string]: string } = {}

const webSocketServer = Bun.serve<WebSocketServerProps>({
  port: 3002,
  fetch(req, server) {
    return processFetch({ req, server })
  },
  websocket: {
    open(ws) {
      processOpen({ ws, users })
    },
    message(ws, message) {
      processMessage({ ws, message, users })
    },
    close(ws) {
      processClose({ ws })
    },
  },
})

console.log(`Listening on ${webSocketServer.hostname}:${webSocketServer.port}`)
