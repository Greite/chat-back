/* eslint-disable no-console */
import { ServerWebSocket } from 'bun'

import WebSocketServerProps from './src/types/WebSocketServerProps'

interface ProcessCloseProps {
  ws: ServerWebSocket<WebSocketServerProps>
}

export default function processClose({ ws }: ProcessCloseProps) {
  console.log(`Connection closed from ${ws.data.username} on channel ${ws.data.channel}`)

  ws.unsubscribe(`channel_${ws.data.channel}`)
}
