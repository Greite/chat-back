/* eslint-disable no-console */
import { ServerWebSocket } from 'bun'

import { WebSocketMessage } from './src/types/WebSocketMessage'
import WebSocketMessageType from './src/types/WebSocketMessageType'
import WebSocketServerProps from './src/types/WebSocketServerProps'
import buildWebSocketMessage from './src/utils/buildWebSocketMessage'

interface ProcessMessageProps {
  ws: ServerWebSocket<WebSocketServerProps>
  message: string | Buffer
  users: { [key: string]: string }
}

export default function processMessage({ ws, message, users }: ProcessMessageProps): { [key: string]: string } {
  const updatedUsers = users
  console.log(`New message from ${ws.data.username} on channel ${ws.data.channel}`)

  const data = JSON.parse(message as string) as WebSocketMessage

  switch (data.type) {
    case WebSocketMessageType.UserList:
      ws.send(
        JSON.stringify(
          buildWebSocketMessage(
            JSON.stringify(Object.values(users)),
            WebSocketMessageType.UserList,
            data.username,
            data.channel,
          ),
        ),
      )
      break
    case WebSocketMessageType.Leave:
      data.content = ws.data.id
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete updatedUsers[ws.data.id]
      ws.publish(`channel_${ws.data.channel}`, JSON.stringify(data))
      break
    default:
      ws.publish(`channel_${ws.data.channel}`, JSON.stringify(data))
      break
  }

  return users
}
